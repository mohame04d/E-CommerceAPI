const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'cart must belong to a user'],
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: [true, 'cart must have a product'],
      },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
    },
  ],

  totalPrice: { type: Number },
});

cartSchema.pre('save', function (next) {
  this.totalPrice = this.products.reduce((sum, el) => {
    return sum + el.quantity * el.price;
  }, 0);
  next();
});

const cart = mongoose.model('cart', cartSchema);
module.exports = cart;
