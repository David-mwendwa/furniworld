import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import axios from 'axios';

import Order from '../models/orderModel.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import {
  mpesaConfigured,
  mpesaPassword,
  toMsisdn,
} from '../middleware/mpesaAuth.js';

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

const stripe = () => {
  if (!stripeConfigured())
    throw new BadRequestError('Card payments are not configured in this deployment');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const DARAJA_BASE = () =>
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

/** Loads an order the caller owns and is still allowed to pay for. */
const payableOrder = async (orderId, user) => {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError('That order could not be found');

  if (String(order.user) !== String(user.id))
    throw new UnauthorizedError('This is not your order');

  if (order.payment.status === 'paid')
    throw new BadRequestError('This order is already paid');

  if (order.status === 'cancelled')
    throw new BadRequestError('This order was cancelled');

  return order;
};

/* ---------------------------------------------------------------- card ---- */

/**
 * POST /payments/card
 *
 * Stripe can answer `requires_action` for a card that needs 3D-Secure rather
 * than succeeding outright, so the order is only marked paid once Stripe says
 * the intent actually succeeded. The client secret goes back either way for the
 * browser to finish the challenge.
 */
export const processCardPayment = async (req, res) => {
  const { orderId, paymentMethodId } = req.body;
  if (!paymentMethodId)
    throw new BadRequestError('No card details were submitted');

  const order = await payableOrder(orderId, req.user);

  let intent;
  try {
    intent = await stripe().paymentIntents.create({
      // Totals are KES, but a test account may not have KES enabled — charge the
      // same figure in the smallest unit of a currency it definitely has, so the
      // demo works regardless of account settings.
      amount: Math.round(order.total * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      payment_method_types: ['card'],
      confirm: true,
      metadata: {
        orderNumber: order.orderNumber,
        orderId: String(order._id),
        userId: String(order.user),
      },
    });
  } catch (error) {
    await order.recordPayment('failed', {
      provider: 'stripe',
      error: {
        code: error.code || 'card_error',
        message: error.message,
        declineCode: error.decline_code,
      },
    });

    throw new BadRequestError(
      error.message || 'That card was declined. Try another card.'
    );
  }

  const card = intent.charges?.data?.[0]?.payment_method_details?.card;

  await order.recordPayment(intent.status === 'succeeded' ? 'paid' : 'processing', {
    provider: 'stripe',
    transactionId: intent.id,
    stripe: {
      paymentIntentId: intent.id,
      paymentMethodId,
      cardBrand: card?.brand,
      cardLast4: card?.last4,
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    status: intent.status,
    requiresAction: intent.status === 'requires_action',
    clientSecret: intent.client_secret,
    order: await Order.findById(order._id),
  });
};

/* --------------------------------------------------------------- mpesa ---- */

/**
 * POST /payments/mpesa
 *
 * Sends a real STK push to the Daraja sandbox. The push genuinely goes out and
 * is accepted, but the sandbox app has no registered test MSISDN able to approve
 * one, so Safaricom's callback always eventually reports a failure no matter
 * which number is used. `MPESA_SIMULATE_CALLBACK` therefore marks the order paid
 * locally so the flow can be shown end to end; the callback below then ignores
 * the real result once it arrives.
 */
export const processMpesaPayment = async (req, res) => {
  const { orderId, phone } = req.body;
  const order = await payableOrder(orderId, req.user);

  const msisdn = toMsisdn(phone || order.shippingAddress.phone);
  if (!/^254[17]\d{8}$/.test(msisdn))
    throw new BadRequestError('Enter a valid Safaricom number, e.g. 0712345678');

  const { password, timestamp } = mpesaPassword();
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.API_URL || ''}/payments/mpesa/callback`;

  let data;
  try {
    ({ data } = await axios.post(
      `${DARAJA_BASE()}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        // Daraja rejects a decimal amount; VAT-inclusive totals carry cents.
        Amount: Math.max(1, Math.round(order.total)),
        PartyA: msisdn,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: msisdn,
        CallBackURL: callbackUrl,
        AccountReference: order.orderNumber,
        TransactionDesc: `Furniworld ${order.orderNumber}`,
      },
      {
        headers: { Authorization: `Bearer ${req.mpesaAccessToken}` },
        timeout: 20000,
      }
    ));
  } catch (error) {
    const message =
      error.response?.data?.errorMessage ||
      error.response?.data?.ResponseDescription ||
      error.message;

    await order.recordPayment('failed', {
      provider: 'mpesa',
      mpesa: { phoneNumber: msisdn },
      error: {
        code: error.response?.data?.errorCode || 'mpesa_error',
        message,
      },
    });

    throw new BadRequestError(`M-Pesa could not start that payment: ${message}`);
  }

  await order.recordPayment('processing', {
    provider: 'mpesa',
    transactionId: data.CheckoutRequestID,
    mpesa: {
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
      phoneNumber: msisdn,
    },
  });

  if (process.env.MPESA_SIMULATE_CALLBACK === 'true') {
    await order.recordPayment('paid', {
      mpesa: {
        receiptNumber: `SIM${Date.now().toString(36).toUpperCase()}`,
        transactionDate: new Date(),
        isSimulated: true,
        resultDesc: 'Marked paid locally — sandbox cannot approve an STK push',
      },
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message:
      process.env.MPESA_SIMULATE_CALLBACK === 'true'
        ? 'Payment recorded. The sandbox cannot approve a real STK push, so this was settled locally.'
        : 'Check your phone and enter your M-Pesa PIN to complete the payment.',
    simulated: process.env.MPESA_SIMULATE_CALLBACK === 'true',
    checkoutRequestId: data.CheckoutRequestID,
    order: await Order.findById(order._id),
  });
};

/** POST /payments/mpesa/callback — Safaricom posts the STK result here. */
export const mpesaCallback = async (req, res) => {
  const result = req.body?.Body?.stkCallback;

  // Always 200: Safaricom retries anything else, and a retry cannot fix a
  // payload we could not read.
  if (!result) return res.status(StatusCodes.OK).json({ received: true });

  const order = await Order.findOne({
    'payment.mpesa.checkoutRequestId': result.CheckoutRequestID,
  });

  if (!order) return res.status(StatusCodes.OK).json({ received: true });

  // The simulated settlement above lands first; the sandbox's real failure
  // arrives later and must not overwrite it.
  if (['paid', 'failed'].includes(order.payment.status))
    return res.status(StatusCodes.OK).json({ received: true });

  if (result.ResultCode === 0) {
    const fields = (result.CallbackMetadata?.Item ?? []).reduce(
      (acc, item) => ({ ...acc, [item.Name]: item.Value }),
      {}
    );

    await order.recordPayment('paid', {
      transactionId: fields.MpesaReceiptNumber,
      mpesa: {
        receiptNumber: fields.MpesaReceiptNumber,
        phoneNumber: String(fields.PhoneNumber ?? ''),
        transactionDate: fields.TransactionDate
          ? new Date(String(fields.TransactionDate).replace(
              /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
              '$1-$2-$3T$4:$5:$6'
            ))
          : new Date(),
        resultCode: String(result.ResultCode),
        resultDesc: result.ResultDesc,
      },
    });
  } else {
    await order.recordPayment('failed', {
      mpesa: {
        resultCode: String(result.ResultCode),
        resultDesc: result.ResultDesc,
      },
      error: { code: String(result.ResultCode), message: result.ResultDesc },
    });
  }

  res.status(StatusCodes.OK).json({ received: true });
};

/* -------------------------------------------------------------- config ---- */

/** GET /payments/status/:orderNumber — lets the client poll a pending push. */
export const checkPaymentStatus = async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    user: req.user.id,
  }).select('orderNumber status payment');

  if (!order) throw new NotFoundError('That order could not be found');

  res.status(StatusCodes.OK).json({
    success: true,
    orderNumber: order.orderNumber,
    status: order.status,
    payment: {
      method: order.payment.method,
      status: order.payment.status,
      receiptNumber: order.payment.mpesa?.receiptNumber,
      transactionId: order.payment.transactionId,
      verification: order.payment.verification,
    },
  });
};

/**
 * GET /payments/config — what the checkout may actually offer.
 *
 * The frontend disables a method rather than letting someone pick one whose
 * gateway call is guaranteed to fail.
 */
export const getPaymentConfig = (req, res) => {
  const card = stripeConfigured();
  const mpesa = mpesaConfigured();

  res.status(StatusCodes.OK).json({
    success: true,
    config: {
      stripePublishableKey: card ? process.env.STRIPE_PUBLISHABLE_KEY : null,
      mpesaShortcode: mpesa ? process.env.MPESA_SHORTCODE : null,
      mpesaSimulated: mpesa && process.env.MPESA_SIMULATE_CALLBACK === 'true',
    },
    methods: [
      {
        id: 'mpesa',
        label: 'M-Pesa',
        description: mpesa
          ? 'Pay by STK push to your phone'
          : 'Not configured in this demo',
        enabled: mpesa,
      },
      {
        id: 'card',
        label: 'Card',
        description: card
          ? 'Visa or Mastercard, in Stripe test mode'
          : 'Not configured in this demo',
        enabled: card,
      },
      {
        id: 'cash_on_delivery',
        label: 'Cash on delivery',
        description: 'Pay the driver when your order arrives',
        enabled: true,
      },
      {
        id: 'bank_transfer',
        label: 'Bank transfer',
        description: 'Transfer, then send us the reference to confirm',
        enabled: true,
      },
    ],
  });
};
