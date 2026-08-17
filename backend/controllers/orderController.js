import { StatusCodes } from 'http-status-codes';
import Order, { ORDER_TRANSITIONS } from '../models/orderModel.js';
import { PAYMENT_METHODS } from '../constants/payment.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import { resolveLines } from './cartController.js';
import { deliveryBandFor } from '../constants/counties.js';
import {
  DELIVERY_FEES,
  VAT_RATE,
  FREE_DELIVERY_THRESHOLD,
} from '../constants/catalog.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import {
  buildFilter,
  buildPagination,
  paginationMeta,
} from '../utils/queryFeatures.js';

const round = (value) => Math.round(value * 100) / 100;

/** Totals are always computed here from database prices, never from the client. */
const priceOrder = (items, county) => {
  const itemsTotal = items.reduce((sum, line) => sum + line.lineTotal, 0);
  const deliveryFee =
    itemsTotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEES[deliveryBandFor(county)];
  const tax = round(itemsTotal * VAT_RATE);

  return {
    itemsTotal: round(itemsTotal),
    deliveryFee,
    tax,
    total: round(itemsTotal + deliveryFee + tax),
  };
};

export const quoteOrder = async (req, res) => {
  const { items } = await resolveLines(req.body.items);
  if (!items.length) throw new BadRequestError('Your cart is empty');

  res.status(StatusCodes.OK).json({
    success: true,
    items,
    ...priceOrder(items, req.body.county),
  });
};

export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, items: clientItems } = req.body;

  if (!shippingAddress?.county)
    throw new BadRequestError('A delivery county is required');

  if (!PAYMENT_METHODS.includes(paymentMethod))
    throw new BadRequestError('Please choose a valid payment method');

  const cart = await Cart.findOne({ user: req.user.id });
  const source = cart?.items?.length ? cart.items : clientItems;

  const { items } = await resolveLines(source);
  if (!items.length)
    throw new BadRequestError('None of the items in your cart are available');

  const totals = priceOrder(items, shippingAddress.county);

  // Stock is decremented conditionally, so two shoppers racing for the last
  // unit cannot both succeed.
  const claimed = [];
  for (const line of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.product, stock: { $gte: line.quantity }, status: 'active' },
      { $inc: { stock: -line.quantity, salesCount: line.quantity } },
      { new: true }
    );

    if (!updated) {
      // Give back whatever was already taken before failing.
      await Promise.all(
        claimed.map((c) =>
          Product.findByIdAndUpdate(c.product, {
            $inc: { stock: c.quantity, salesCount: -c.quantity },
          })
        )
      );
      throw new BadRequestError(
        `${line.name} sold out while you were checking out`
      );
    }

    claimed.push(line);
  }

  // The order is created unpaid. Money is taken in a second step against this
  // order (see paymentController), so nothing here can claim a payment that has
  // not been attempted yet.
  const order = await Order.create({
    orderNumber: await Order.generateOrderNumber(),
    user: req.user.id,
    items: items.map((line) => ({
      product: line.product,
      name: line.name,
      slug: line.slug,
      image: line.image,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    })),
    shippingAddress,
    ...totals,
    payment: { method: paymentMethod, status: 'pending' },
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

  res.status(StatusCodes.CREATED).json({ success: true, order });
};

export const getMyOrders = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 10,
    maxLimit: 50,
  });

  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    orders,
    meta: paginationMeta({ page, limit, total }),
  });
};

export const getMyOrder = async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    user: req.user.id,
  });

  if (!order) throw new NotFoundError('That order could not be found');
  res.status(StatusCodes.OK).json({ success: true, order });
};

export const cancelMyOrder = async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    user: req.user.id,
  });

  if (!order) throw new NotFoundError('That order could not be found');

  if (!ORDER_TRANSITIONS[order.status].includes('cancelled'))
    throw new BadRequestError(
      `An order that is already ${order.status} cannot be cancelled`
    );

  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      })
    )
  );

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({
    status: 'cancelled',
    note: order.cancelReason,
    changedBy: req.user.id,
  });
  await order.save();

  res.status(StatusCodes.OK).json({ success: true, order });
};

/* ---------- admin ---------- */

export const listOrders = async (req, res) => {
  const filter = buildFilter(req.query, {
    allowedFilters: ['status', 'payment.status'],
    searchFields: ['orderNumber', 'shippingAddress.fullName'],
  });

  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    orders,
    meta: paginationMeta({ page, limit, total }),
  });
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('statusHistory.changedBy', 'name');

  if (!order) throw new NotFoundError('That order could not be found');
  res.status(StatusCodes.OK).json({ success: true, order });
};

export const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new NotFoundError('That order could not be found');

  const allowed = ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(status))
    throw new BadRequestError(
      allowed.length
        ? `An order that is ${order.status} can only move to: ${allowed.join(', ')}`
        : `An order that is ${order.status} cannot change status`
    );

  if (status === 'cancelled') {
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, salesCount: -item.quantity },
        })
      )
    );
    order.cancelledAt = new Date();
    order.cancelReason = note || 'Cancelled by staff';
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    // Cash collected on delivery is NOT settled here. A driver saying they took
    // the money is a claim; an admin confirms it from the payment queue, which
    // is the only place `paid` is set by hand.
  }

  order.status = status;
  order.statusHistory.push({ status, note, changedBy: req.user.id });
  await order.save();

  res.status(StatusCodes.OK).json({ success: true, order });
};

export const getTransitions = (req, res) =>
  res.status(StatusCodes.OK).json({ success: true, transitions: ORDER_TRANSITIONS });
