import mongoose from 'mongoose';
import { COUNTIES } from '../constants/counties.js';
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_CHANNELS,
  VERIFICATION_STATES,
} from '../constants/payment.js';

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
    payment: {
      method: { type: String, required: true, enum: PAYMENT_METHODS },
      status: {
        type: String,
        enum: PAYMENT_STATUSES,
        default: 'pending',
        index: true,
      },
      provider: { type: String, enum: PAYMENT_PROVIDERS },
      transactionId: { type: String, trim: true },

      stripe: {
        paymentIntentId: String,
        paymentMethodId: String,
        cardBrand: String,
        cardLast4: String,
      },

      mpesa: {
        checkoutRequestId: String,
        merchantRequestId: String,
        receiptNumber: String,
        phoneNumber: String,
        transactionDate: Date,
        resultCode: String,
        resultDesc: String,
        isSimulated: Boolean,
      },

      error: {
        code: String,
        message: String,
        declineCode: String,
      },

      timestamps: {
        initiatedAt: Date,
        completedAt: Date,
        failedAt: Date,
      },

      /**
       * The human check. `state` is deliberately separate from `status` above:
       * a customer sending a transaction code is making a claim, and one field
       * for both would let the claim mark the order paid.
       */
      verification: {
        state: { type: String, enum: VERIFICATION_STATES, default: 'none' },
        reference: { type: String, trim: true },
        channel: { type: String, enum: PAYMENT_CHANNELS },
        amountReceived: { type: Number, min: 0 },
        payerNote: { type: String, trim: true, maxlength: 500 },
        submittedAt: Date,
        submittedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
        reviewedAt: Date,
        reviewedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
        reviewNote: { type: String, trim: true, maxlength: 500 },
      },
    },
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
orderSchema.index({ 'payment.verification.state': 1, createdAt: -1 });
orderSchema.index({ 'payment.mpesa.checkoutRequestId': 1 });

// Both virtuals tolerate a projection that left their source field out, since
// list queries select only the columns they display.
orderSchema.virtual('itemCount').get(function () {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
});

orderSchema.virtual('isCancellable').get(function () {
  return ORDER_TRANSITIONS[this.status]?.includes('cancelled') ?? false;
});

/**
 * Records a gateway outcome on the order. Nothing here touches
 * `payment.verification` — that is the human decision, and a gateway reporting
 * success is exactly the claim a person is meant to be checking.
 */
orderSchema.methods.recordPayment = async function (status, details = {}) {
  this.payment.status = status;

  if (details.provider) this.payment.provider = details.provider;
  if (details.transactionId) this.payment.transactionId = details.transactionId;
  if (details.stripe) Object.assign(this.payment.stripe, details.stripe);
  if (details.mpesa) Object.assign(this.payment.mpesa, details.mpesa);

  if (details.error) this.payment.error = details.error;
  else if (status === 'paid') this.payment.error = undefined;

  const now = new Date();
  if (status === 'paid') this.payment.timestamps.completedAt = now;
  if (status === 'failed') this.payment.timestamps.failedAt = now;
  if (status === 'processing' && !this.payment.timestamps.initiatedAt)
    this.payment.timestamps.initiatedAt = now;

  // Money arriving is the signal to start picking. Anything further along stays
  // put — a delivered order settled in cash must not walk back to processing.
  if (status === 'paid' && this.status === 'pending') this.status = 'processing';

  await this.save({ validateModifiedOnly: true });
  return this;
};

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
