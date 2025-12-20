const catchAsync = require('./../utlis/catchAsync');
const apiFeatures = require('./../utlis/apiFeatures');
const user = require('./../modules/userModel');
const AppError = require('../utlis/appError');

const filterRequestBody = (requestBody, ...attributedFiltering) => {
  const newObject = {};
  Object.keys(requestBody).forEach((el) => {
    if (attributedFiltering.includes(el)) newObject[el] = requestBody[el];
  });
  return newObject;
};

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  res.status(201).json({
    status: 'success',
    data: req.user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  const filterBody = filterRequestBody(req.body, 'name', 'email');
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'this route is not for password update,please use /updatePassword',
        400
      )
    );

  const updatedMe = await user.findByIdAndUpdate(req.params.id, filterBody, {
    new: true,
    runValidators: true,
  });

  for (let x in req.body) {
    if (!Object.hasOwn(filterBody, x))
      return next(new AppError('not allowed to modify that fields', 400));
  }

  res.status(200).json({
    status: 'success',
    data: { updatedMe },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  const deletedUser = await user.findByIdAndUpdate(req.params.id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(user.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const users = await features.query;
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const oneUser = await user.findById(req.params.id);
  if (!oneUser) return next(new AppError('no user with that id', 404));
  res.status(200).json({
    status: 'success',
    data: { oneUser },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await user.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return next(new AppError('no user with that id', 404));
  res.status(200).json({
    status: 'success',
    data: { updatedUser },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await user.findByIdAndUpdate(req.params.id,{active:false});
  if (!deletedUser) return next(new AppError('no user with that id', 404));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
