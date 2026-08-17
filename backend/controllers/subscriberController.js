import { StatusCodes } from 'http-status-codes';
import Subscriber from '../models/subscriberModel.js';
import { BadRequestError } from '../errors/customErrors.js';
import { sendEmail } from '../utils/sendEmail.js';
import { subscriptionConfirmedEmail } from '../utils/emailTemplates.js';

/**
 * POST /subscribers — `optionalAuth`, so it works for a guest and for someone
 * signed in.
 *
 * Signed in, this is the same switch as the one on the account page: it sets
 * `newsletterOptIn` on the caller's own account and mails their own address,
 * never a fixed staff inbox and never whatever a signed-in visitor happened to
 * type in the box. Signed out, there is no account to hold the preference, so
 * a `Subscriber` row is the record instead.
 */
export const subscribe = async (req, res) => {
  if (req.user) {
    req.user.newsletterOptIn = true;
    await req.user.save({ validateModifiedOnly: true });

    const { subject, html } = subscriptionConfirmedEmail({ email: req.user.email });
    sendEmail({ email: req.user.email, subject, html }).catch(() => {});

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "You're on the list — one email a month, nothing else.",
      newsletterOptIn: true,
    });
  }

  const email = String(req.body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestError('Enter a valid email address');

  const existing = await Subscriber.findOne({ email });

  if (!existing) {
    await Subscriber.create({ email, source: req.body.source || 'newsletter' });
    const { subject, html } = subscriptionConfirmedEmail({ email });
    // Best-effort: a slow or failed confirmation must not fail the visitor's
    // signup, which has already succeeded.
    sendEmail({ email, subject, html }).catch(() => {});
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "You're on the list — one email a month, nothing else.",
  });
};
