const dotenv = require('dotenv');
dotenv.config({ path: `./config.env` });
const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const catchAsync = require('./../utlis/catchAsync');
const product = require('./../modules/productModel');
const booking = require('../modules/bookingModel');
const apiFeatures = require('./../utlis/apiFeatures');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const Products = await product.find({ _id: { $in: req.body.products } });
  const line_items = Products.map((p) => {
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${p.name}`,
          description: p.discription,
          image: p.images,
        },
        unit_amount: p.price * 100,
      },
      quantity: 1,
    };
  });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-orders?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/products`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items,
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});
exports.getMonthlySales = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const sales = await booking.aggregate([
    {
      $unwind: '$product',
    },
    {
      $lookup:{
        from:'products',
        localField:'product',
        foreignField:'_id',
        as:'productData'
      }
    },
    {
      $unwind:'$productData'
    }, 
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        quantity:{$sum:1},
        products:{$push:{name:'$productData.name',price:'$productData.price'}}
    }},
    {
      $addFields:{
        month:'$_id'
      }
    },
    {
      $project:{
        _id:0
      }
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    sales,
  });
});
exports.getAllBooking = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(booking.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const bookings = await features.query;
  res.status(200).json({
    status: 'success',
    result: bookings.length,
    data: { bookings },
  });
});
exports.getOneBooking = catchAsync(async (req, res, next) => {
  const oneBooking = await booking.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { oneBooking },
  });
});
exports.createBooking = catchAsync(async (req, res, next) => {
  const bookingCreated = await booking.create(req.body);
  res.status(201).json({
    status: 'success',
    data: bookingCreated,
  });
});
exports.updateBooking = catchAsync(async (req, res, next) => {
  const bookingUpdated = await booking.findByIdAndUpdate(
    req.params.id,
    req.body
  );
  res.status(200).json({
    status: 'success',
    data: { bookingUpdated },
  });
});
exports.deleteBooking = catchAsync(async (req, res, next) => {
  const bookingDeleted = await booking.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
