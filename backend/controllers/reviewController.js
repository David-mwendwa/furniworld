import { StatusCodes } from 'http-status-codes';
import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import { buildPagination, paginationMeta } from '../utils/queryFeatures.js';

export const getProductReviews = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).select('_id');
  if (!product) throw new NotFoundError('That product could not be found');

  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 10,
    maxLimit: 50,
  });

  const filter = { product: product._id, status: 'published' };

  const [reviews, total, breakdown] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    reviews,
    breakdown: Object.fromEntries(breakdown.map((b) => [b._id, b.count])),
    meta: paginationMeta({ page, limit, total }),
  });
};

export const createReview = async (req, res) => {
  const { rating, title, body } = req.body;

  const product = await Product.findById(req.params.productId).select('_id');
  if (!product) throw new NotFoundError('That product could not be found');

  if (await Review.findOne({ product: product._id, user: req.user.id }))
    throw new ConflictError('You have already reviewed this product');

  const purchase = await Order.findOne({
    user: req.user.id,
    'items.product': product._id,
    status: { $in: ['shipped', 'delivered'] },
  }).select('_id');

  const review = await Review.create({
    product: product._id,
    user: req.user.id,
    order: purchase?._id,
    verifiedPurchase: Boolean(purchase),
    rating,
    title,
    body,
  });

  res.status(StatusCodes.CREATED).json({ success: true, review });
};

export const updateMyReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('That review could not be found');

  if (String(review.user._id ?? review.user) !== String(req.user.id))
    throw new UnauthorizedError('You can only edit your own review');

  const { rating, title, body } = req.body;
  Object.assign(review, {
    rating: rating ?? review.rating,
    title: title ?? review.title,
    body: body ?? review.body,
  });
  await review.save();

  res.status(StatusCodes.OK).json({ success: true, review });
};

export const deleteMyReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('That review could not be found');

  const isOwner = String(review.user._id ?? review.user) === String(req.user.id);
  if (!isOwner && req.user.role !== 'admin')
    throw new UnauthorizedError('You can only delete your own review');

  await review.deleteOne();
  await Review.recalcRatings(review.product);

  res.status(StatusCodes.OK).json({ success: true, message: 'Review removed' });
};

export const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ success: true, reviews });
};

/* ---------- admin ---------- */

export const listReviews = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    reviews,
    meta: paginationMeta({ page, limit, total }),
  });
};

export const setReviewStatus = async (req, res) => {
  const { status } = req.body;
  if (!['published', 'hidden'].includes(status))
    throw new BadRequestError('Status must be published or hidden');

  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('That review could not be found');

  review.status = status;
  await review.save();
  await Review.recalcRatings(review.product);

  res.status(StatusCodes.OK).json({ success: true, review });
};
