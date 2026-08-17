import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Product from '../models/productModel.js';
import products from '../data/products.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.join(__dirname, '../public/images/products');

const run = async () => {
  const DB = process.env.DATABASE_URL || process.env.MONGO_URI;
  if (!DB) throw new Error('DATABASE_URL is not set');

  await mongoose.connect(DB);
  console.log(`Connected to ${mongoose.connection.name}`);

  const missing = products
    .map((p) => path.basename(p.images[0].url))
    .filter((file) => !fs.existsSync(path.join(IMAGE_DIR, file)));

  if (missing.length) {
    console.warn(`Missing ${missing.length} image file(s):`);
    missing.forEach((file) => console.warn(`  - ${file}`));
  }

  await Product.deleteMany();
  console.log('Cleared existing products');

  // Saved one at a time rather than via insertMany so the slug hook runs and
  // collisions get their numeric suffix.
  for (const product of products) await Product.create(product);

  const count = await Product.countDocuments();
  const featured = await Product.countDocuments({ featured: true });
  const onSale = await Product.countDocuments({ compareAtPrice: { $gt: 0 } });

  console.log(`Seeded ${count} products (${featured} featured, ${onSale} on sale)`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
