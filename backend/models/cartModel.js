import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        _id: false,
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1, max: 20, default: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    // Abandoned carts clean themselves up rather than accumulating forever.
    lastActiveAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  },
  { timestamps: true }
);

cartSchema.statics.forUser = async function (userId) {
  return (
    (await this.findOne({ user: userId })) ||
    (await this.create({ user: userId, items: [] }))
  );
};

export default mongoose.model('Cart', cartSchema);
