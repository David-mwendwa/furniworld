import mongoose from 'mongoose';
import { COUNTIES } from '../constants/counties.js';

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// Both the controller and the admin status dropdown read legal moves from here,
// so there is one definition of the workflow.
export const ORDER_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const PAYMENT_METHODS = [
  'mpesa-simulated',
  'card-simulated',
  'cash-on-delivery',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
    // Name, image and price are snapshots: an order must keep showing what was
    // bought at the price paid, even after the product is edited or archived.
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'An order needs at least one item',
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: (v) => /^(?:\+254|0)[17]\d{8}$/.test(v),
          message: 'Please enter a valid Kenyan phone number',
        },
      },
      email: { type: String, required: true, trim: true, lowercase: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      county: { type: String, required: true, enum: COUNTIES },
      postalCode: { type: String, trim: true },
      deliveryNotes: { type: String, trim: true, maxlength: 300 },
    },
    itemsTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KES', enum: ['KES'] },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentReference: { type: String, trim: true },
    paidAt: Date,
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES, required: true },
        note: { type: String, trim: true, maxlength: 300 },
        changedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: { type: String, trim: true, maxlength: 300 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Both virtuals tolerate a projection that left their source field out, since
// list queries select only the columns they display.
orderSchema.virtual('itemCount').get(function () {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
});

orderSchema.virtual('isCancellable').get(function () {
  return ORDER_TRANSITIONS[this.status]?.includes('cancelled') ?? false;
});

orderSchema.statics.generateOrderNumber = async function () {
  const now = new Date();
  const stamp = [
    `${now.getFullYear()}`.slice(2),
    `${now.getMonth() + 1}`.padStart(2, '0'),
    `${now.getDate()}`.padStart(2, '0'),
  ].join('');

  const todayCount = await this.countDocuments({
    orderNumber: new RegExp(`^FW-${stamp}-`),
  });

  return `FW-${stamp}-${`${todayCount + 1}`.padStart(4, '0')}`;
};

export default mongoose.model('Order', orderSchema);
