import 'express-async-errors';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import sanitizeBody from './middleware/sanitizeBody.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.set('trust proxy', 1);

// Ahead of everything that produces a body. The catalogue and cart endpoints
// return JSON that is mostly repeated keys and product prose — close to gzip's
// best case — and no listing renders until it lands.
app.use(compression());

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PROD_FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, health checks) are allowed through.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

if (!isProduction) app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(sanitizeBody);
app.use(hpp({ whitelist: ['category', 'subcategory', 'tags'] }));

// Helmet's default Cross-Origin-Resource-Policy is same-origin, which blocks the
// frontend (a different port) from loading these images. Widen it here only.
app.use(
  '/images',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'public/images'), { maxAge: '30d' })
);

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'public/uploads'), { maxAge: '7d' })
);

app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
);

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isProduction ? 300 : 2000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
  })
);

app.use(
  '/api/v1/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isProduction ? 20 : 500,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many authentication attempts, please try again later.',
  })
);

/*
 * Public catalogue reads may be cached; everything else may not.
 *
 * The API runs on Render's free plan and takes ~23s to answer the first request
 * after it has been idle. Nothing here makes it boot faster, but this stops a
 * returning shopper needing it to have booted at all: the product listings and
 * the facets are the same bytes for everyone, so a browser and any CDN in front
 * of it can serve a repeat view without a round trip. `stale-while-revalidate`
 * is the part that matters most — past the fresh window the cached copy is
 * still served immediately and refreshed behind the shopper, so nobody sits
 * through the wake-up.
 *
 * The guards are load-bearing:
 *
 *   - **GET only.** Marking a mutation cacheable is how a stale response gets
 *     served for an order.
 *   - **No credentials.** `/products` is public but is also read while signed
 *     in, and `Vary` alone is not enough — marking a response `public` when the
 *     request carried a token is how one user's response ends up in a shared
 *     cache and is handed to another.
 */
const CACHEABLE_PUBLIC_GET = /^\/api\/v1\/products(\/|$)/;

app.use((req, res, next) => {
  if (req.method !== 'GET' || !CACHEABLE_PUBLIC_GET.test(req.path)) return next();

  if (req.headers.authorization || req.headers.cookie) {
    res.set('Cache-Control', 'private, no-store');
    return next();
  }

  res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
  // Without these a cache keyed only on the URL could hand a compressed body to
  // a client that cannot read one, or serve a CORS-approved response to an
  // origin that was never checked.
  res.vary('Accept-Encoding');
  res.vary('Origin');
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/subscribers', subscriberRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
