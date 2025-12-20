const mongoose = require('mongoose');
const validator = require('validator');
const { validate } = require('./productModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'please enter your name'] },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, 'please enter valid email or password'],
  },

  password: {
    type: String,
    required: [true, 'please enter your password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'please enter your passwordConfirm'],
    minlength: 8,
    select: false,
    validate: {
      validator: function (val) {
        return val == this.password ? true : false;
      },
      message: 'passords are not the same',
    },
  },

  role: {
    type: String,
    enum: ['customer', 'seller', 'admin', 'manager'],
    default: 'customer',
  },

  photo: { type: String },
  passwordResetToken: String,
  passwordChangetAt: Date,
  passwordTokenExpired: Date,
  tokenVersion: { type: Number, default: 0 },

  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.passwordChangetAt = Date.now() - 1000;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.comparePasswords = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.changePassword = function (jwtTimeIat) {
  if (this.passwordChangetAt) {
    const changTimeToSecond = this.passwordChangetAt.getTime() / 1000;
    return changTimeToSecond > jwtTimeIat;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordTokenExpired = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

const user = mongoose.model('user', userSchema);
module.exports = user;