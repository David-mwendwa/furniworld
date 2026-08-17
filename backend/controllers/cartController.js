import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';

const CART_FIELDS = 'name slug price compareAtPrice images stock status';

/**
 * Resolves client-held [{ productId, quantity }] into priced lines using the
 * database as the source of truth, dropping anything no longer purchasable.
 * The client never sends prices, so a stale cart cannot fix an old price.
 */
const resolveLines = async (rawItems) => {
  const wanted = new Map();

  for (const item of rawItems ?? []) {
    const id = item?.productId ?? item?.product;
    if (!mongoose.isValidObjectId(id)) continue;
    const quantity = Math.min(20, Math.max(1, parseInt(item.quantity, 10) || 1));
    wanted.set(String(id), quantity);
  }

  if (!wanted.size) return { items: [], removed: [] };

  const products = await Product.find({
    _id: { $in: [...wanted.keys()] },
  }).select(CART_FIELDS);

  const items = [];
  const removed = [];

  for (const product of products) {
    const requested = wanted.get(String(product._id));

    if (product.status !== 'active' || product.stock === 0) {
      removed.push({ name: product.name, reason: 'unavailable' });
      continue;
    }

    const quantity = Math.min(requested, product.stock);

    items.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? '',
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      quantity,
      lineTotal: product.price * quantity,
      adjusted: quantity !== requested,
    });
  }

  const foundIds = new Set(products.map((p) => String(p._id)));
  for (const id of wanted.keys())
    if (!foundIds.has(id)) removed.push({ name: 'An item', reason: 'removed' });

  return { items, removed };
};

const summarize = (items) => ({
  itemsTotal: items.reduce((sum, line) => sum + line.lineTotal, 0),
  itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
});

export const validateCart = async (req, res) => {
  const { items, removed } = await resolveLines(req.body.items);
  res
    .status(StatusCodes.OK)
    .json({ success: true, items, removed, ...summarize(items) });
};

export const getCart = async (req, res) => {
  const cart = await Cart.forUser(req.user.id);
  const { items, removed } = await resolveLines(cart.items);
  res
    .status(StatusCodes.OK)
    .json({ success: true, items, removed, ...summarize(items) });
};

export const setCart = async (req, res) => {
  const { items } = await resolveLines(req.body.items);

  await Cart.findOneAndUpdate(
    { user: req.user.id },
    {
      items: items.map(({ product, quantity }) => ({ product, quantity })),
      lastActiveAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.status(StatusCodes.OK).json({ success: true, items, ...summarize(items) });
};

export const mergeCart = async (req, res) => {
  const cart = await Cart.forUser(req.user.id);

  const merged = new Map(
    cart.items.map((item) => [String(item.product), item.quantity])
  );

  for (const item of req.body.items ?? []) {
    const id = item?.productId ?? item?.product;
    if (!mongoose.isValidObjectId(id)) continue;
    const quantity = Math.min(20, Math.max(1, parseInt(item.quantity, 10) || 1));
    // Higher quantity wins so merging never silently shrinks a cart.
    merged.set(String(id), Math.max(merged.get(String(id)) ?? 0, quantity));
  }

  const { items } = await resolveLines(
    [...merged].map(([productId, quantity]) => ({ productId, quantity }))
  );

  cart.items = items.map(({ product, quantity }) => ({ product, quantity }));
  cart.lastActiveAt = new Date();
  await cart.save();

  res.status(StatusCodes.OK).json({ success: true, items, ...summarize(items) });
};

export const addItem = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!mongoose.isValidObjectId(productId))
    throw new BadRequestError('A valid product is required');

  const product = await Product.findById(productId).select(CART_FIELDS);
  if (!product || product.status !== 'active')
    throw new NotFoundError('That product is not available');

  const cart = await Cart.forUser(req.user.id);
  const existing = cart.items.find(
    (item) => String(item.product) === String(productId)
  );

  const requested =
    (existing?.quantity ?? 0) + Math.max(1, parseInt(quantity, 10) || 1);
  const capped = Math.min(requested, product.stock, 20);

  if (existing) existing.quantity = capped;
  else cart.items.push({ product: productId, quantity: capped });

  cart.lastActiveAt = new Date();
  await cart.save();

  const { items } = await resolveLines(cart.items);
  res
    .status(StatusCodes.OK)
    .json({ success: true, items, ...summarize(items) });
};

export const removeItem = async (req, res) => {
  const cart = await Cart.forUser(req.user.id);
  cart.items = cart.items.filter(
    (item) => String(item.product) !== req.params.productId
  );
  cart.lastActiveAt = new Date();
  await cart.save();

  const { items } = await resolveLines(cart.items);
  res
    .status(StatusCodes.OK)
    .json({ success: true, items, ...summarize(items) });
};

export const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
  res
    .status(StatusCodes.OK)
    .json({ success: true, items: [], itemsTotal: 0, itemCount: 0 });
};

export { resolveLines };
