const express = require('express');
const productcontroller = require('../controllers/productController');
const authController = require('./../controllers/authController');
const router = express.Router();

router
  .route('/')
  .get(authController.protect, productcontroller.getAllproducts)
  .post(
    authController.protect,
    authController.restrict('admin', 'manager'),
    productcontroller.createProducts
  );

router
  .route('/topratedproducts')
  .get(productcontroller.gettopratedproduct, productcontroller.getAllproducts);

router.route('/products-stats').get(productcontroller.getproductsstats);

router
  .route('/:id')
  .get(authController.protect, productcontroller.getoneProduct)
  .patch(
    authController.protect,
    authController.restrict('admin', 'manager'),
    productcontroller.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrict('admin', 'manager'),
    productcontroller.deleteProduct
  );
module.exports = router;
