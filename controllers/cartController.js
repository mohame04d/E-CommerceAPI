const catchAsync = require('./../utlis/catchAsync');
const appError = require('./../utlis/appError');
const Cart = require('./../modules/cartModel');
const Product = require('./../modules/productModel');
const product = require('./../modules/productModel');
const cart = require('./../modules/cartModel');

function totalPrice(oneCart) {
  return cart.reduce((sum, el) => {
    sum + el.quantity * el.price;
  }, 0);
}
exports.addtoCart = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) return next(new appError('product not found', 404));

  const price = product.price;
  let cartItem = await Cart.findOne({ user });

  if (!cartItem) {
    cartItem = await Cart.create({
      products: [{ productId, quantity, price }],
      user,
    });
  } else {
    const index = cartItem.products.findIndex((p) => p.productId == productId);
    if (index == -1) cartItem.products.push({ productId, quantity, price });
    else cartItem.products[index].quantity += quantity;
  }
  await cartItem.save();

  res.status(201).json({
    status: 'success',
    data: { cartItem },
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return next(new appError('not exist cart for you', 404));

  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

exports.deleteOneProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const deletedProduct = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { products: { productId: productId } } },
    { new: true }
  );

  if (!deletedProduct) return next(new appError('not exist cart for you', 404));

  totalPrice(deletedProduct.products);
  await deletedProduct.save();

  res.status(201).json({
    status: 'success',
    data: deletedProduct,
  });
});

exports.updateCart = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const { productId, quantity } = req.body;
  const updatedCart = await Cart.findOne({ user });

  if (!updatedCart) return next(new appError('not exist cart for you', 404));

  const index = updatedCart.products.findIndex((p) => p.productId == productId);

  if (index == -1)
    return next(new appError('this product does not exist', 404));

  updatedCart.products[index].quantity = quantity;
  totalPrice(updatedCart.products);
  await updatedCart.save();

  res.status(201).json({
    status: 'success',
    data: { updatedCart },
  });
});

exports.deleteAllCarts = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const deletedCart = await Cart.findOneAndDelete(user);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
