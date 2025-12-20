const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const validator = require('validator');
const crypto = require('crypto');
const { promisify } = require('util');
const user = require('./../modules/userModel');
const appError = require('./../utlis/appError');
const catchAsync = require('./../utlis/catchAsync');
const sendEmail = require('./../utlis/email');
dotenv.config({ path: './../config.env' });

const signToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

const sendToken = async (user, statscode, res) => {
  const token = signToken(user._id, user.tokenVersion);

  const cookiesOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRESIN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == 'production') cookiesOptions.secure = true;

  res.cookie('jwt', token, cookiesOptions);
  user.password = undefined;
  res.status(statscode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await user.create(req.body);
  sendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return new appError('please enter your email and password', 400);

  if (!validator.isEmail(email)) {
    return next(new appError('please enter valid email', 400));
  }

  const storedUser = await user.findOne({ email }).select('+password');
  if (
    !storedUser ||
    !(await storedUser.comparePasswords(password, storedUser.password))
  ) {
    return new appError('incorrect email or password', 401);
  }

  storedUser.tokenVersion += 1;
  await storedUser.save();
  sendToken(storedUser, 201, res);
});
exports.logOut = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new appError('you are not loggedIn,please logIn', 401));
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await user.findById(decoded.id);

  if (!freshUser)
    return next(
      new appError(
        `the user belonging to this token doesn't exist,please logIn again`,
        401
      )
    );

  if (freshUser.changePassword(decoded.iat))
    return next(
      new appError('user recently change pasword,please log in again', 401)
    );

  if (decoded.tokenVersion !== freshUser.tokenVersion)
    return next(new appError('the old token not valid', 401));
  req.user = freshUser;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new appError(`you don't have permision to perform this action`, 404)
      );
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const userForgettedPassword = await user.findOne({ email: req.body.email });
  if (!userForgettedPassword)
    return next(new appError('there no user with this email', 404));

  const resetToken = userForgettedPassword.createPasswordResetToken();
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH 
  request with your new password and passwordConfirm to:
   ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: userForgettedPassword.email,
      subject: 'your password reset token( valid for 10 mintues)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token send to email',
    });
    await userForgettedPassword.save();
  } catch (err) {
    userForgettedPassword.passwordResetToken = undefined;
    userForgettedPassword.passwordTokenExpired = undefined;
    await userForgettedPassword.save();
    next(
      new appError(
        'there was an error sending the email,please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const userForgettedPassword2 = await user.findOne({
    passwordResetToken: hashedToken,
    passwordTokenExpired: { $gt: Date.now() },
  });

  if (!userForgettedPassword2)
    return next(new appError('token has invalid or has expired', 400));
  userForgettedPassword2.password = req.body.password;
  userForgettedPassword2.passwordConfirm = req.body.passwordConfirm;
  userForgettedPassword2.passwordResetToken = undefined;
  userForgettedPassword2.passwordTokenExpired = undefined;
  await userForgettedPassword2.save();
  sendToken(userForgettedPassword2, 201, res);
});

exports.updatedPassword = catchAsync(async (req, res, next) => {
  const userUpdatedPassword = await user
    .findById(req.user.id)
    .select('+password');
  if (
    !userUpdatedPassword ||
    !(await userUpdatedPassword.comparePasswords(
      req.body.currentPassword,
      userUpdatedPassword.password
    ))
  )
    return next(new appError('password is false', 401));

  userUpdatedPassword.password = req.body.password;
  userUpdatedPassword.passwordConfirm = req.body.passwordConfirm;
  await userUpdatedPassword.save();
  sendToken(userUpdatedPassword, 201, res);  
});  