import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.ObjectId, ref: 'Order' },
    rating: {
      type: Number,
      required: [true, 'Please give a rating'],
      min: [1, 'The lowest rating is 1'],
      max: [5, 'The highest rating is 5'],
    },
    title: { type: String, trim: true, maxlength: 100 },
    body: {
      type: String,
      required: [true, 'Please write a review'],
      trim: true,
      minlength: [10, 'Your review must be at least 10 characters'],
      maxlength: [1000, 'Your review cannot exceed 1000 characters'],
    },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
    verifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name avatarUrl' });
  next();
});

reviewSchema.statics.recalcRatings = async function (productId) {
  const [summary] = await this.aggregate([
    { $match: { product: productId, status: 'published' } },
    {
      $group: {
        _id: '$product',
        count: { $sum: 1 },
        average: { $avg: '$rating' },
      },
    },
  ]);

  await mongoose.model('Product').findByIdAndUpdate(productId, {
    ratingsCount: summary?.count ?? 0,
    ratingsAverage: summary?.average ?? 0,
  });
};

reviewSchema.post('save', function () {
  return this.constructor.recalcRatings(this.product);
});

reviewSchema.post(/^findOneAnd/, function (doc) {
  if (doc) return doc.constructor.recalcRatings(doc.product);
});

export default mongoose.model('Review', reviewSchema);
