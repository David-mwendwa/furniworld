import { StatusCodes } from 'http-status-codes';

import Order from '../models/orderModel.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
  paymentConfirmedEmail,
  paymentRejectedEmail,
} from '../utils/emailTemplates.js';
import {
  PAYMENT_CHANNELS,
  SETTLED_PAYMENT_STATUSES,
} from '../constants/payment.js';
import { buildPagination, paginationMeta, escapeRegex } from '../utils/queryFeatures.js';

/**
 * ## Confirming that money actually arrived
 *
 * Every automated payment path here can report success with nothing having
 * moved. The M-Pesa integration runs against Safaricom's sandbox with
 * `MPESA_SIMULATE_CALLBACK=true`, because that sandbox app has no test MSISDN
 * able to approve an STK push — so the write that flips an order to `paid` is
 * one the server makes to itself. Cash on delivery is money handed to a driver
 * with nothing watching. A bank transfer is only ever confirmed by a person
 * reading a statement.
 *
 * So there is a human step, in two halves:
 *
 *  - the payer submits a claim (`submitPaymentReference`) — an M-Pesa code, a
 *    bank reference. A claim is not a payment, which is why it writes
 *    `payment.verification.state` and never `payment.status`.
 *  - an admin decides (`reviewPayment`), and that decision is the only thing in
 *    the app that sets `paid` by hand.
 */

/** POST /orders/my/:orderNumber/payment/reference — the payer's own claim. */
export const submitPaymentReference = async (req, res) => {
  const { reference, channel, payerNote } = req.body;

  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
  });

  if (!order) throw new NotFoundError('That order could not be found');

  // Owner only: a claim recorded under someone else's name is exactly what the
  // reviewer is supposed to be able to trust.
  if (String(order.user) !== String(req.user.id))
    throw new UnauthorizedError('This is not your order');

  if (order.payment.status === 'paid')
    throw new BadRequestError('This order is already paid — there is nothing to send us');

  if (SETTLED_PAYMENT_STATUSES.includes(order.payment.status))
    throw new BadRequestError('This order has been refunded');

  if (order.status === 'cancelled')
    throw new BadRequestError('This order was cancelled');

  const trimmed = String(reference ?? '').trim();
  if (!trimmed)
    throw new BadRequestError(
      'Enter the transaction code from your payment confirmation'
    );
  if (trimmed.length > 64)
    throw new BadRequestError('That reference is too long — check and re-enter it');

  if (channel && !PAYMENT_CHANNELS.includes(channel))
    throw new BadRequestError('Choose how you paid');

  order.payment.verification = {
    state: 'submitted',
    reference: trimmed.toUpperCase(),
    channel: channel || (order.payment.method === 'mpesa' ? 'mpesa' : 'other'),
    payerNote: String(payerNote ?? '').trim() || undefined,
    submittedAt: new Date(),
    submittedBy: req.user.id,
    // A resubmission starts a fresh review; carrying the old decision forward
    // would show "rejected" beside the code just sent to replace it.
    reviewedAt: undefined,
    reviewedBy: undefined,
    reviewNote: undefined,
    amountReceived: undefined,
  };

  await order.save({ validateModifiedOnly: true });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Thanks — we'll check this against our records and email you either way.",
    verification: order.payment.verification,
  });
};

/* ---------------------------------------------------------------- admin ---- */

const toReviewRow = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  createdAt: order.createdAt,
  status: order.status,
  total: order.total,
  itemCount: (order.items ?? []).reduce((n, item) => n + item.quantity, 0),
  customer: {
    name: order.shippingAddress?.fullName ?? order.user?.name ?? '—',
    email: order.shippingAddress?.email ?? order.user?.email ?? null,
    phone: order.shippingAddress?.phone ?? null,
  },
  payment: {
    method: order.payment?.method,
    status: order.payment?.status,
    provider: order.payment?.provider,
    transactionId: order.payment?.transactionId,
    mpesaReceipt: order.payment?.mpesa?.receiptNumber,
    isSimulated: order.payment?.mpesa?.isSimulated ?? false,
    verification: order.payment?.verification ?? { state: 'none' },
  },
});

/**
 * GET /payments/review — the queue.
 *
 *   awaiting  — a customer claim nobody has looked at, plus anything a gateway
 *               marked paid that no person has confirmed
 *   submitted — customer claims only
 *   unpaid    — placed, not cancelled, no money recorded
 *   confirmed / rejected — the decision history
 */
const QUEUE_FILTERS = {
  awaiting: {
    status: { $ne: 'cancelled' },
    $or: [
      { 'payment.verification.state': 'submitted' },
      {
        'payment.status': 'paid',
        'payment.verification.state': { $in: [null, 'none'] },
      },
    ],
  },
  submitted: { 'payment.verification.state': 'submitted' },
  unpaid: {
    status: { $ne: 'cancelled' },
    'payment.status': { $in: ['pending', 'processing', 'authorized', 'failed'] },
  },
  confirmed: { 'payment.verification.state': 'confirmed' },
  rejected: { 'payment.verification.state': 'rejected' },
  all: {},
};

export const listPaymentsForReview = async (req, res) => {
  const state = QUEUE_FILTERS[req.query.state] ? req.query.state : 'awaiting';
  const stateFilter = QUEUE_FILTERS[state];

  const term = String(req.query.search ?? '').trim();

  // $and, never a spread merge: the `awaiting` filter already owns a top-level
  // $or, and a second one would silently replace it — widening the queue to
  // every order matching the text, in any payment state.
  const query = term
    ? {
        $and: [
          stateFilter,
          {
            $or: [
              { orderNumber: new RegExp(escapeRegex(term), 'i') },
              { 'shippingAddress.email': new RegExp(escapeRegex(term), 'i') },
              { 'shippingAddress.fullName': new RegExp(escapeRegex(term), 'i') },
              {
                'payment.verification.reference': new RegExp(escapeRegex(term), 'i'),
              },
              { 'payment.transactionId': new RegExp(escapeRegex(term), 'i') },
            ],
          },
        ],
      }
    : stateFilter;

  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [orders, total, submittedCount, unpaidCount] = await Promise.all([
    Order.find(query)
      .sort({ 'payment.verification.submittedAt': -1, createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(query),
    Order.countDocuments(QUEUE_FILTERS.submitted),
    Order.countDocuments(QUEUE_FILTERS.unpaid),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    state,
    orders: orders.map(toReviewRow),
    meta: paginationMeta({ page, limit, total }),
    // Tab badges, cheap enough to send every time so a label cannot go stale
    // straight after a decision.
    counts: { submitted: submittedCount, unpaid: unpaidCount },
  });
};

/**
 * PATCH /payments/review/:id — the admin decision.
 *
 * Rejecting does not cancel the order: a wrong reference is a typo far more
 * often than fraud, and cancelling would release stock somebody is trying to
 * pay for.
 */
export const reviewPayment = async (req, res) => {
  const { decision, reference, channel, amountReceived, reviewNote } = req.body;

  if (!['confirm', 'reject'].includes(decision))
    throw new BadRequestError("Decision must be 'confirm' or 'reject'");

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new NotFoundError('That order could not be found');

  if (SETTLED_PAYMENT_STATUSES.includes(order.payment.status))
    throw new BadRequestError('This payment has already been refunded');

  const note = String(reviewNote ?? '').trim();
  if (decision === 'reject' && !note)
    // Without one the customer is told "rejected" and has to ask why, turning a
    // self-service step back into a support conversation.
    throw new BadRequestError('Say why you are rejecting it — the customer sees this');

  if (channel && !PAYMENT_CHANNELS.includes(channel))
    throw new BadRequestError('Choose how the payment came in');

  const existing = order.payment.verification ?? {};
  const resolvedReference =
    String(reference ?? '').trim().toUpperCase() ||
    existing.reference ||
    order.payment.transactionId;

  if (decision === 'confirm' && !resolvedReference)
    throw new BadRequestError(
      'Record the transaction reference — a confirmation with nothing to check against is not a record'
    );

  const amount =
    amountReceived === undefined || amountReceived === null || amountReceived === ''
      ? order.total
      : Number(amountReceived);

  if (decision === 'confirm' && (!Number.isFinite(amount) || amount <= 0))
    throw new BadRequestError('Enter the amount received');

  const now = new Date();

  order.payment.verification = {
    state: decision === 'confirm' ? 'confirmed' : 'rejected',
    reference: resolvedReference,
    channel:
      channel ||
      existing.channel ||
      (order.payment.method === 'mpesa' ? 'mpesa' : 'other'),
    amountReceived: decision === 'confirm' ? amount : undefined,
    payerNote: existing.payerNote,
    submittedAt: existing.submittedAt,
    submittedBy: existing.submittedBy,
    reviewedAt: now,
    reviewedBy: req.user.id,
    reviewNote: note || undefined,
  };

  if (decision === 'confirm') {
    order.payment.status = 'paid';
    order.payment.provider = order.payment.provider || 'manual';
    order.payment.transactionId = resolvedReference;
    order.payment.timestamps.completedAt = now;

    if (order.status === 'pending') {
      order.status = 'processing';
      order.statusHistory.push({
        status: 'processing',
        note: 'Payment confirmed',
        changedBy: req.user.id,
        changedAt: now,
      });
    }
  } else if (order.payment.status === 'paid') {
    // Reversing an earlier confirmation — a gateway "success" that turned out to
    // be nothing. Back to pending, not failed: `failed` reads as the customer's
    // card being declined, and the order is still live.
    order.payment.status = 'pending';
    order.payment.timestamps.completedAt = undefined;
  }

  await order.save({ validateModifiedOnly: true });

  const email = order.shippingAddress?.email ?? order.user?.email;
  if (email) {
    const template =
      decision === 'confirm'
        ? paymentConfirmedEmail({ order, amount, reference: resolvedReference })
        : paymentRejectedEmail({ order, reason: note });

    // Never let the mail step fail the decision — the money is confirmed either
    // way, and sendEmail already falls back to logging.
    try {
      await sendEmail({ email, ...template });
    } catch (error) {
      console.error('Payment decision email failed:', error.message);
    }
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message:
      decision === 'confirm'
        ? `Payment confirmed for ${order.orderNumber}`
        : `Marked ${order.orderNumber} as not received`,
    order: toReviewRow(order),
  });
};
