const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
router.use(authController.protect);
router.route('/checkout-session').post(bookingController.getCheckoutSession);

router.use(authController.restrict('admin'));
router.route('/monthlySales/:year').get(bookingController.getMonthlySales);
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;  