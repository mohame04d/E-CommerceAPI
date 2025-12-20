const catchAsync = require('./../utlis/catchAsync');
const Review = require('./../modules/reviewModel');
const appError = require('./../utlis/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  if (!reviews) return next(new appError('not exist any review', 404));

  res.status(200).json({
    status: 'success',
    data: { reviews },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const oneReview = await Review.findById(user);

  if (!oneReview) next(new appError('not exist review to you', 404));

  res.status(200).json({
    status: 'success',
    data: { oneReview },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const { review, rating, product } = req.body;
  const createReview = await Review.create({ review, product, user, rating });

  res.status(201).json({
    status: 'success',
    data: { createReview },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { rating } = req.body;
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { rating },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: 'success',
    data: { updatedReview },
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  const deletedReview = await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
