/**
 * Payment state in words that can't be mistaken for the order's fulfilment
 * state. Both enums share the word "pending", and the order workflow also has
 * a "processing" step, so printed raw the two states read like the same
 * question asked twice, or worse, like a contradiction. None of the labels
 * below is a word in the order-status enum (pending, processing, shipped,
 * delivered, cancelled).
 */
export const PAYMENT_LABELS = {
  paid: 'Paid',
  pending: 'Unpaid',
  processing: 'Payment in progress',
  authorized: 'Authorised, not captured',
  failed: 'Payment failed',
  refunded: 'Money refunded',
  partially_refunded: 'Partly refunded',
};

/** Falls back to the de-underscored enum, so a new status is readable, not blank. */
export const paymentLabel = (status) =>
  PAYMENT_LABELS[status] || (status ? status.replace(/_/g, ' ') : '');

export const PAYMENT_TONES = {
  paid: 'success',
  pending: 'warning',
  processing: 'info',
  authorized: 'info',
  failed: 'danger',
  refunded: 'neutral',
  partially_refunded: 'neutral',
};

export const paymentTone = (status) => PAYMENT_TONES[status] || 'neutral';

export const VERIFICATION_LABELS = {
  none: '',
  submitted: 'Awaiting review',
  confirmed: 'Confirmed by us',
  rejected: 'Not matched',
};

export const verificationLabel = (state) => VERIFICATION_LABELS[state] || '';

export const PAYMENT_METHOD_LABELS = {
  card: 'Card',
  mpesa: 'M-Pesa',
  cash_on_delivery: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
};

export const paymentMethodLabel = (method) =>
  PAYMENT_METHOD_LABELS[method] || (method ? method.replace(/_/g, ' ') : '');

/**
 * Where an actual bank transfer goes. Demo details for a portfolio project —
 * a real deployment would pull this from an env var, not a committed
 * constant. Shown wherever a customer needs to know how to pay, not just
 * where they confirm they already have: the checkout step, the order
 * confirmation, and the order's own page while it's still unpaid.
 */
export const BANK_TRANSFER_DETAILS = {
  bankName: 'Equity Bank',
  accountName: 'Furniworld Ltd',
  accountNumber: '1234567890',
  branch: 'Westlands',
};
