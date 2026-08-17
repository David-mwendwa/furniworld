import { StatusCodes } from 'http-status-codes';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';

const REVENUE_STATUSES = ['processing', 'shipped', 'delivered'];

export const getDashboardStats = async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    revenue,
    orderCounts,
    productCount,
    lowStock,
    userCount,
    pendingReviews,
    salesByDay,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.countDocuments({ status: 'active' }),
    Product.find({
      status: 'active',
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    })
      .select('name slug stock lowStockThreshold images')
      .limit(8),
    User.countDocuments({ role: 'user' }),
    Review.countDocuments({ status: 'published' }),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { name: '$items.name', slug: '$items.slug' },
          units: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderNumber total status createdAt user itemsTotal'),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    stats: {
      revenue: revenue[0]?.total ?? 0,
      paidOrders: revenue[0]?.count ?? 0,
      orderCounts: Object.fromEntries(
        orderCounts.map(({ _id, count }) => [_id, count])
      ),
      productCount,
      userCount,
      reviewCount: pendingReviews,
      averageOrderValue: revenue[0]?.count
        ? Math.round(revenue[0].total / revenue[0].count)
        : 0,
    },
    salesByDay: salesByDay.map(({ _id, revenue: r, orders }) => ({
      date: _id,
      revenue: r,
      orders,
    })),
    topProducts: topProducts.map(({ _id, units, revenue: r }) => ({
      ..._id,
      units,
      revenue: r,
    })),
    lowStock,
    recentOrders,
  });
};
