const mongoose = require('mongoose');
const validator = require('validator');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'a product must have name'],
      maxlength: [25, 'a name must less than 25'],
      unique: true,
    },

    category: {
      type: String,
      required: [true, 'a product must have category'],
    },

    price: { type: Number, required: [true, 'a product must have price'] },
    priceAfterDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount({VALUE}) must be below price',
      },
    },

    discription: { type: String, trim: true },
    quantity: { type: Number },
    sold: { type: Number },

    ratingQuantity: { type: Number, default: 0 },
    ratingAverage: {
      type: Number,
      minlength: [1, 'a rating must be more than 1'],
      maxlength: [5, 'a rating must be equal or less than 5'],
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },

    coverImage: {
      type: String,
      required: [true, 'a product must have coverImage'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ name: 1, ratingAverage: -1 });

const product = mongoose.model('product', productSchema);
module.exports = product;