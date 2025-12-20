const dotenv = require('dotenv');
dotenv.config({ path: './../config.env' });
const appError = require('./../utlis/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} ${err.value}`;
  return new appError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};

const handleValidationError = (err) => {
  const error = err.error;
  const message = `Invalid input data. ${error}`;
  return new appError(message, 400);
};

const handleJwtError = () => {
  return new appError(`invalid token,please logIn again `, 401);
};

const handleJwtExpiredError = () => {
  return new appError(`your token has expired,please logIn again`, 401);
};
const sendDevError = (err, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendProdError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        staus: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'something went vwry wrong!',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //development environment
  if (process.env.NODE_ENV == 'development') sendDevError(err, req, res);

  //production environment
  if (process.env.NODE_ENV == 'production') {
    if (err.name == 'CastError') err = handleCastError(err);
    if (err.name == 'ValidationError') err = handleValidationError(err);
    if (err.code == 11000) err = handleDuplicateFields(err);
    if (err.name == 'jsonwebTokenError') err = handleJwtError(err);
    if (err.name == 'TokenExpiredError') err = handleJwtExpiredError(err);
    sendProdError(err, req, res);
  }
};
