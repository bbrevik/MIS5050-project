'use-strict';

const express = require('express');
const authenticateUser = require('../controllers/authenticateUser');
const reviewController = require('../controllers/reviewController');

// mergeParams will merge the tour params and allow access in this router

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenticateUser.authCheck,
    authenticateUser.validateIsAdmin('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authenticateUser.authCheck,
//     authenticateUser.validateIsAdmin('user'),
//     reviewController.createReview
//   );

module.exports = router;
