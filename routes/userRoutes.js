const app = require('./../app');
const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

router.route('/signUP').post(authController.signUp);
router.route('/logIn').post(authController.logIn);
router.route('/logOut').get(authController.logOut);
router.route('/forgetPassword').post(authController.forgetPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect)
router
  .route('/updatePassword')
  .patch( authController.updatedPassword);
router.route('/getMe').get( userController.getMe);
router
  .route('/updateMe')
  .patch( userController.updateMe);
router
  .route('/deleteMe')
  .patch( userController.deleteMe);

  router.use(authController.restrict('admin'))
router
  .route('/getAllUsers')
  .get(
    userController.getAllUser
  );
router
  .route('/:id')
  .get(
    userController.getOneUser
  )
  .patch(
    userController.updateUser
  )
  .delete(
    userController.deleteUser
  );
module.exports = router;
