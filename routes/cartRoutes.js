const express = require('express');
const router = express.Router();
const cartController = require('./../controllers/cartController');
const authController = require('./../controllers/authController');

router.use(authController.protect);
router
  .route('/')
  .post(cartController.addtoCart)
  .get(cartController.getCart)
  .patch(cartController.deleteOneProduct)
  .delete(cartController.deleteAllCarts);
router.route('/updateCart').patch(cartController.updateCart);

module.exports = router;
