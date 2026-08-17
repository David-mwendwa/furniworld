import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Enter a valid email address',
      },
    },
    source: { type: String, default: 'newsletter', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Subscriber', subscriberSchema);
