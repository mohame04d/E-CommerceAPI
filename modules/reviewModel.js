const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'review can not be empty'] },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, 'review must be belond to user'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'product',
      required: [true, 'review must be belong to produt'],
    },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.statics.calcRating = async function (product) {
  const stats = await this.aggregate([
    {
      $match: { product },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(product, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  }
};

reviewSchema.post('save', function (next) {
  this.constructor.calcRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcRating(this.r.product);
});

const review = mongoose.model('review', reviewSchema);
module.exports = review;
