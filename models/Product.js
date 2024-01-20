import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter a price'],
      default: 0,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    // image: {
    //   required: false,
    //   public_id: {
    //     type: String,
    //     required: true,
    //   },
    //   url: {
    //     type: String,
    //     required: true,
    //   },
    // },
    filename: {
      type: String,
    },
    categories: {
      required: true,
      type: [String],
      enum: [
        'Chairs',
        'Office',
        'Desks',
        'Festive Bonanza Sale',
        'Living Room',
        'Tv Stands & Coffee Tables',
        'Recliners',
        'Sofas',
        'Dining Room',
        'Console',
        'Reception Desks',
        'Beds',
      ],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
