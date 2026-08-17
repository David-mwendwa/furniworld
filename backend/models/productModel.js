import mongoose from 'mongoose';
import {
  CATEGORIES,
  SUBCATEGORIES,
  PRODUCT_STATUSES,
} from '../constants/catalog.js';

export const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, maxlength: 160 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a product name'],
      trim: true,
      minlength: [3, 'The name must be at least 3 characters'],
      maxlength: [120, 'The name cannot exceed 120 characters'],
    },
    slug: { type: String, unique: true, index: true, lowercase: true },
    sku: { type: String, unique: true, sparse: true, trim: true, uppercase: true },
    description: {
      type: String,
      required: [true, 'Please enter a description'],
      trim: true,
      minlength: [40, 'The description must be at least 40 characters'],
      maxlength: [4000, 'The description cannot exceed 4000 characters'],
    },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    category: {
      type: String,
      required: [true, 'Please choose a category'],
      enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' },
      index: true,
    },
    subcategory: {
      type: String,
      required: [true, 'Please choose a subcategory'],
      enum: {
        values: SUBCATEGORIES,
        message: '{VALUE} is not a valid subcategory',
      },
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter a price'],
      min: [0, 'The price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'The compare-at price cannot be negative'],
      validate: {
        validator(v) {
          return v == null || v > this.price;
        },
        message: 'The compare-at price must be higher than the price',
      },
    },
    currency: { type: String, default: 'KES', enum: ['KES'] },
    images: {
      type: [imageSchema],
      validate: {
        validator: (v) => v.length >= 1 && v.length <= 8,
        message: 'A product needs between 1 and 8 images',
      },
    },
    sourceUrl: { type: String, trim: true },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: 'active',
      index: true,
    },
    featured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
    attributes: {
      material: { type: String, trim: true },
      colour: { type: String, trim: true },
      // No `default` on any field in here: a default inside a nested object makes
      // Mongoose vivify the whole subdocument even when it was never set.
      dimensions: {
        width: Number,
        depth: Number,
        height: Number,
        unit: { type: String, enum: ['cm', 'mm', 'm'] },
      },
      seats: Number,
      weightKg: Number,
      warrantyMonths: Number,
      assemblyRequired: Boolean,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10,
    },
    ratingsCount: { type: Number, default: 0, min: 0 },
    salesCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });
productSchema.index({ status: 1, category: 1, subcategory: 1, price: 1 });
productSchema.index({ status: 1, featured: 1, createdAt: -1 });
productSchema.index({ ratingsAverage: -1 });

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

productSchema.virtual('onSale').get(function () {
  return Boolean(this.compareAtPrice && this.compareAtPrice > this.price);
});

productSchema.virtual('discountPercent').get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(
    ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
  );
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.pre('validate', async function () {
  if (!this.isModified('name') && this.slug) return;

  const base = slugify(this.name);
  let candidate = base;
  let suffix = 2;

  /* eslint-disable no-await-in-loop */
  while (
    await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  this.slug = candidate;
});

export default mongoose.model('Product', productSchema);
