export const PAYMENT_METHODS = [
  'card',
  'mpesa',
  'cash_on_delivery',
  'bank_transfer',
];

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'authorized',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
];

export const PAYMENT_PROVIDERS = ['stripe', 'mpesa', 'manual'];

/** How money actually arrived, as recorded by a person during verification. */
export const PAYMENT_CHANNELS = [
  'mpesa',
  'bank_transfer',
  'cash',
  'card',
  'other',
];

/**
 * The human-verification state, deliberately separate from payment status.
 *
 *   none      — nobody has claimed or checked anything
 *   submitted — the payer sent a reference; it is a claim, not a payment
 *   confirmed — a person matched it against the records
 *   rejected  — a person could not match it
 */
export const VERIFICATION_STATES = ['none', 'submitted', 'confirmed', 'rejected'];

/** Payment states where asking for the money again makes no sense. */
export const SETTLED_PAYMENT_STATUSES = ['refunded', 'partially_refunded'];
