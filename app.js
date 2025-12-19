const express = require('express');
const app = express();

const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoter = require('./routes/reviewRoutes');

const appError = require('./utlis/appError');
const errorController = require('./controllers/errorContrroller');

const morgan = require('morgan');
const helmet = require('helmet');
const ratelimiter = require('express-rate-limit');
const cookieparser = require('cookie-parser');
const hpp = require('hpp');
app.use(morgan('dev'));
app.use(helmet());

const limiter = ratelimiter({
  max: 100,
  windowMs: 1000 * 60 * 60,
  message: 'too many request from this ip,please try again in an hour',
});

app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(cookieparser());
app.use(hpp());

app.use('/api/v1/products', productRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/reviews', reviewRoter);

app.use((req, res, next) => {
  next(new appError(`can't find ${req.originalUrl} on the server`, 404));
});
app.use(errorController);

module.exports = app;
