const router = require('express').Router();
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

router.use(authController.protect);

router.get(
  '/',
  authController.restrict('admin'),
  reviewController.getAllReviews
);

router.get('/', reviewController.getReview);
router.post('/', reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
