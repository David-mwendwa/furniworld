import { StatusCodes } from 'http-status-codes';
import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';
import {
  buildFilter,
  buildPagination,
  paginationMeta,
} from '../utils/queryFeatures.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { ratingsAverage: -1, ratingsCount: -1 },
  popular: { salesCount: -1, ratingsCount: -1 },
  name: { name: 1 },
};

const LIST_FIELDS =
  'name slug price compareAtPrice images category subcategory stock lowStockThreshold status featured tags ratingsAverage ratingsCount salesCount createdAt';

export const getProducts = async (req, res) => {
  const filter = buildFilter(req.query, {
    allowedFilters: ['category', 'subcategory', 'price', 'tags', 'featured'],
    searchFields: ['name', 'shortDescription'],
  });

  // Shoppers only ever see active products; the admin list uses its own handler.
  filter.status = 'active';

  if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
  if (req.query.onSale === 'true') filter.compareAtPrice = { $gt: 0 };

  const { page, limit, skip } = buildPagination(req.query);
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

  const [products, total] = await Promise.all([
    Product.find(filter).select(LIST_FIELDS).sort(sort).skip(skip).limit(limit),
    // Counted against the same filter — the original counted every document in
    // the collection, so filtered pages reported the wrong total.
    Product.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    products,
    meta: paginationMeta({ page, limit, total }),
  });
};

export const getProduct = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    status: 'active',
  });

  if (!product) throw new NotFoundError('That product could not be found');

  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(20),
    Product.find({
      _id: { $ne: product._id },
      subcategory: product.subcategory,
      status: 'active',
    })
      .select(LIST_FIELDS)
      .limit(4),
  ]);

  res.status(StatusCodes.OK).json({ success: true, product, reviews, related });
};

export const getFeatured = async (req, res) => {
  const products = await Product.find({ status: 'active', featured: true })
    .select(LIST_FIELDS)
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(StatusCodes.OK).json({ success: true, products });
};

export const getFacets = async (req, res) => {
  const [categories, priceRange] = await Promise.all([
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: { category: '$category', subcategory: '$subcategory' },
          count: { $sum: 1 },
        },
      },
    ]),
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
        },
      },
    ]),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    categories: categories.map(({ _id, count }) => ({ ..._id, count })),
    priceRange: priceRange[0]
      ? { min: priceRange[0].min, max: priceRange[0].max }
      : { min: 0, max: 0 },
  });
};

/* ---------- admin ---------- */

export const listAllProducts = async (req, res) => {
  const filter = buildFilter(req.query, {
    allowedFilters: ['category', 'subcategory', 'status'],
    searchFields: ['name', 'sku'],
  });

  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    products,
    meta: paginationMeta({ page, limit, total }),
  });
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new NotFoundError('That product could not be found');
  res.status(StatusCodes.OK).json({ success: true, product });
};

const normalizeDimensions = (attributes) => {
  const dims = attributes?.dimensions;
  if (!dims) return attributes;

  const hasMeasurement = ['width', 'depth', 'height'].some(
    (key) => dims[key] != null && dims[key] !== ''
  );

  if (!hasMeasurement) {
    const { dimensions, ...rest } = attributes;
    return rest;
  }

  return { ...attributes, dimensions: { ...dims, unit: dims.unit || 'cm' } };
};

export const createProduct = async (req, res) => {
  const payload = { ...req.body, createdBy: req.user.id };
  if (payload.attributes)
    payload.attributes = normalizeDimensions(payload.attributes);

  const product = await Product.create(payload);
  res.status(StatusCodes.CREATED).json({ success: true, product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new NotFoundError('That product could not be found');

  const payload = { ...req.body };
  delete payload.ratingsAverage;
  delete payload.ratingsCount;
  delete payload.salesCount;

  if (payload.attributes)
    payload.attributes = normalizeDimensions(payload.attributes);

  Object.assign(product, payload);
  await product.save();

  res.status(StatusCodes.OK).json({ success: true, product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new NotFoundError('That product could not be found');

  // Archived rather than removed so existing orders keep resolving their
  // product reference.
  product.status = 'archived';
  await product.save();

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Product archived' });
};

export const attachImages = async (req, res) => {
  if (!req.files?.length) throw new BadRequestError('No images were uploaded');

  const images = req.files.map((file) => ({
    url: `/uploads/products/${file.filename}`,
    alt: req.body.alt || '',
  }));

  res.status(StatusCodes.CREATED).json({ success: true, images });
};
