import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import { deliveryBandFor } from '../constants/counties.js';
import {
  DELIVERY_FEES,
  VAT_RATE,
  FREE_DELIVERY_THRESHOLD,
} from '../constants/catalog.js';

dotenv.config();

const DEMO_USERS = [
  {
    name: 'Demo Shopper',
    email: 'demo@furniworld.ke',
    password: 'demo12345',
    phone: '0712345678',
    role: 'user',
  },
  {
    name: 'Furniworld Admin',
    email: 'admin@furniworld.ke',
    password: 'admin12345',
    phone: '0722334455',
    role: 'admin',
  },
];

const REVIEWERS = [
  { name: 'Achieng Otieno', email: 'achieng@example.ke' },
  { name: 'Brian Kamau', email: 'brian@example.ke' },
  { name: 'Faith Wanjiru', email: 'faith@example.ke' },
  { name: 'Hassan Ali', email: 'hassan@example.ke' },
  { name: 'Njeri Mutua', email: 'njeri@example.ke' },
  { name: 'Peter Ochieng', email: 'peter@example.ke' },
];

const REVIEW_COPY = [
  { rating: 5, title: 'Exactly as pictured', body: 'Delivered on the day they promised and the finish is better than I expected from the photos. The assembly took about twenty minutes.' },
  { rating: 5, title: 'Worth the money', body: 'We looked at three shops before this one and nothing came close at the price. Solid, no wobble, and it fits the space perfectly.' },
  { rating: 4, title: 'Very good, minor niggle', body: 'Really pleased with it overall. One of the fixings was missing from the pack but they couriered a replacement the next morning.' },
  { rating: 5, title: 'Beautiful piece', body: 'Everyone who comes over comments on it. The marble is properly sealed too, a red wine spill wiped straight off.' },
  { rating: 4, title: 'Good quality', body: 'Sturdy and well made. Slightly larger in person than I had pictured, so measure your space first, but no complaints.' },
  { rating: 5, title: 'Second one I have bought', body: 'Bought one for the living room last year and came back for another. Holding up perfectly with two children in the house.' },
  { rating: 3, title: 'Fine, delivery was slow', body: 'The item itself is decent for the price. Delivery upcountry took longer than quoted, which was frustrating.' },
  { rating: 5, title: 'Great service', body: 'Ordered on a Friday, delivered Monday, carried it up to the first floor without being asked. Very happy.' },
  { rating: 4, title: 'Does the job well', body: 'Simple, well finished, and the drawers run smoothly. Would recommend to anyone furnishing a first home.' },
];

const ADDRESSES = [
  { addressLine1: 'Kilimani, Wood Avenue', city: 'Nairobi', county: 'Nairobi', postalCode: '00100' },
  { addressLine1: 'Nyali, Links Road', city: 'Mombasa', county: 'Mombasa', postalCode: '80100' },
  { addressLine1: 'Milimani Estate', city: 'Kisumu', county: 'Kisumu', postalCode: '40100' },
  { addressLine1: 'Ruaka, Limuru Road', city: 'Kiambu', county: 'Kiambu', postalCode: '00232' },
  { addressLine1: 'Section 58', city: 'Nakuru', county: 'Nakuru', postalCode: '20100' },
];

const PAYMENT_METHODS = ['mpesa', 'card', 'cash_on_delivery', 'bank_transfer'];

const round = (v) => Math.round(v * 100) / 100;
const pick = (arr, i) => arr[i % arr.length];

const referenceFor = (method, createdAt) => {
  const stamp = createdAt.getTime().toString(36).toUpperCase();
  if (method === 'mpesa') return `Q${stamp}`;
  if (method === 'card') return `pi_${stamp.toLowerCase()}`;
  if (method === 'bank_transfer') return `FT${stamp}`;
  return `CASH${stamp}`;
};

/**
 * Spreads the demo orders across every verification state so the admin payment
 * queue has a realistic mix — one claim waiting, one rejected, some confirmed,
 * and some gateway "successes" nobody has checked yet.
 */
const verificationFor = (index, plan, isPaid, reference, createdAt) => {
  if (plan.status === 'cancelled') return { state: 'none' };

  // An unpaid order with a claim sitting in the queue.
  if (!isPaid && index === 4)
    return {
      state: 'submitted',
      reference,
      channel: 'bank_transfer',
      payerNote: 'Transferred from my Equity account this morning',
      submittedAt: new Date(createdAt.getTime() + 3600000),
    };

  // A rejected claim the customer still has to fix.
  if (!isPaid)
    return {
      state: 'rejected',
      reference,
      channel: 'mpesa',
      reviewedAt: new Date(createdAt.getTime() + 7200000),
      reviewNote:
        'That code belongs to a payment of Ksh 500, which does not match this order.',
    };

  // Older paid orders have been checked; the most recent has not, so the queue
  // is never empty.
  if (index < 3)
    return {
      state: 'confirmed',
      reference,
      channel: 'mpesa',
      amountReceived: undefined,
      reviewedAt: new Date(createdAt.getTime() + 86400000),
      reviewNote: 'Matched against the statement.',
    };

  return { state: 'none' };
};

const findOrCreateUser = async ({ email, ...rest }) => {
  const existing = await User.findOne({ email }).select('+active');
  if (existing) return existing;
  return User.create({ email, ...rest });
};

const run = async () => {
  const DB = process.env.DATABASE_URL || process.env.MONGO_URI;
  if (!DB) throw new Error('DATABASE_URL is not set');

  await mongoose.connect(DB);
  console.log(`Connected to ${mongoose.connection.name}`);

  const products = await Product.find({ status: 'active' });
  if (!products.length)
    throw new Error('No products found — run `npm run seed` first');

  const demoUsers = [];
  for (const user of DEMO_USERS) demoUsers.push(await findOrCreateUser(user));

  const reviewers = [];
  for (const reviewer of REVIEWERS)
    reviewers.push(
      await findOrCreateUser({
        ...reviewer,
        password: 'reviewer12345',
        role: 'user',
      })
    );

  console.log(`Users ready: ${demoUsers.length} demo, ${reviewers.length} reviewers`);

  const shopper = demoUsers[0];

  /* ---------- orders for the demo shopper ---------- */

  if ((await Order.countDocuments({ user: shopper._id })) === 0) {
    const plans = [
      { status: 'delivered', daysAgo: 42, size: 2 },
      { status: 'delivered', daysAgo: 24, size: 1 },
      { status: 'shipped', daysAgo: 8, size: 3 },
      { status: 'processing', daysAgo: 3, size: 1 },
      { status: 'pending', daysAgo: 1, size: 2 },
      { status: 'cancelled', daysAgo: 17, size: 1 },
    ];

    let cursor = 0;

    for (const [index, plan] of plans.entries()) {
      const chosen = products.slice(cursor, cursor + plan.size);
      cursor += plan.size;

      const items = chosen.map((product, i) => {
        const quantity = i === 0 ? 1 : ((index + i) % 2) + 1;
        return {
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0].url,
          unitPrice: product.price,
          quantity,
          lineTotal: product.price * quantity,
        };
      });

      const address = pick(ADDRESSES, index);
      const itemsTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
      const deliveryFee =
        itemsTotal >= FREE_DELIVERY_THRESHOLD
          ? 0
          : DELIVERY_FEES[deliveryBandFor(address.county)];
      const tax = round(itemsTotal * VAT_RATE);

      const createdAt = new Date(Date.now() - plan.daysAgo * 86400000);
      const paymentMethod = pick(PAYMENT_METHODS, index);
      const reference = referenceFor(paymentMethod, createdAt);
      const isPaid =
        plan.status !== 'cancelled' &&
        (paymentMethod !== 'cash_on_delivery' || plan.status === 'delivered');

      const history = [
        { status: 'pending', note: 'Order placed', changedAt: createdAt },
      ];
      const sequence = {
        delivered: ['processing', 'shipped', 'delivered'],
        shipped: ['processing', 'shipped'],
        processing: ['processing'],
        pending: [],
        cancelled: ['cancelled'],
      }[plan.status];

      sequence.forEach((status, step) =>
        history.push({
          status,
          changedAt: new Date(createdAt.getTime() + (step + 1) * 86400000),
        })
      );

      await Order.create({
        orderNumber: await Order.generateOrderNumber(),
        user: shopper._id,
        items,
        shippingAddress: {
          fullName: shopper.name,
          phone: shopper.phone,
          email: shopper.email,
          ...address,
        },
        itemsTotal: round(itemsTotal),
        deliveryFee,
        tax,
        total: round(itemsTotal + deliveryFee + tax),
        payment: {
          method: paymentMethod,
          status: isPaid ? 'paid' : 'pending',
          provider:
            paymentMethod === 'card'
              ? 'stripe'
              : paymentMethod === 'mpesa'
                ? 'mpesa'
                : 'manual',
          transactionId: isPaid ? reference : undefined,
          mpesa:
            paymentMethod === 'mpesa' && isPaid
              ? {
                  receiptNumber: reference,
                  phoneNumber: '254712345678',
                  transactionDate: createdAt,
                }
              : undefined,
          timestamps: { completedAt: isPaid ? createdAt : undefined },
          // A spread of verification states so the admin payment queue has a
          // realistic mix rather than one row repeated.
          verification: verificationFor(index, plan, isPaid, reference, createdAt),
        },
        status: plan.status,
        statusHistory: history,
        deliveredAt: plan.status === 'delivered' ? new Date(createdAt.getTime() + 3 * 86400000) : undefined,
        cancelledAt: plan.status === 'cancelled' ? new Date(createdAt.getTime() + 86400000) : undefined,
        cancelReason: plan.status === 'cancelled' ? 'Changed my mind about the colour' : undefined,
        createdAt,
      });
    }

    console.log(`Created ${plans.length} orders for ${shopper.email}`);
  } else {
    console.log('Demo orders already present, skipping');
  }

  /* ---------- reviews spread across the catalogue ---------- */

  if ((await Review.countDocuments()) === 0) {
    let written = 0;

    // Every third product gets reviews, so the grid shows a mix of rated and
    // unrated items rather than a uniform five stars everywhere.
    for (const [index, product] of products.entries()) {
      if (index % 3 !== 0) continue;

      const count = (index % 3) + 1 + (product.featured ? 2 : 0);

      for (let n = 0; n < count; n += 1) {
        const reviewer = pick(reviewers, index + n);
        const copy = pick(REVIEW_COPY, index + n * 2);

        await Review.create({
          product: product._id,
          user: reviewer._id,
          rating: copy.rating,
          title: copy.title,
          body: copy.body,
          verifiedPurchase: (index + n) % 3 !== 0,
          helpfulCount: (index * 3 + n) % 12,
          createdAt: new Date(Date.now() - ((index + n) % 90) * 86400000),
        });
        written += 1;
      }
    }

    console.log(`Created ${written} reviews`);
  } else {
    console.log('Reviews already present, skipping');
  }

  console.log('\nDemo logins:');
  DEMO_USERS.forEach((u) =>
    console.log(`  ${u.role.padEnd(5)}  ${u.email}  /  ${u.password}`)
  );

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
