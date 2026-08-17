import axios from 'axios';
import { BadRequestError } from '../errors/customErrors.js';

const BASE_URL = () =>
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

export const mpesaConfigured = () =>
  Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  );

// Daraja tokens last an hour; cached module-side and refreshed early so a
// request never races the expiry.
let cached = { token: null, expiresAt: 0 };

const fetchToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const { data } = await axios.get(
    `${BASE_URL()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` }, timeout: 15000 }
  );

  cached = {
    token: data.access_token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return cached.token;
};

export const getMpesaToken = async () => {
  if (cached.token && Date.now() < cached.expiresAt) return cached.token;
  return fetchToken();
};

/** Attaches a Daraja access token, refusing early if M-Pesa is not configured. */
const mpesaAuth = async (req, res, next) => {
  if (!mpesaConfigured())
    throw new BadRequestError('M-Pesa is not configured in this deployment');

  req.mpesaAccessToken = await getMpesaToken();
  next();
};

export const mpesaPassword = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  return { password, timestamp };
};

/** Daraja requires 2547XXXXXXXX; accepts 07…, +2547…, 2547… */
export const toMsisdn = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return `254${digits.slice(-9)}`;
};

export default mpesaAuth;
