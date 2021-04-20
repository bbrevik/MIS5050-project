'use-strict';

const express = require('express');
const authenticateUser = require('../controllers/authenticateUser');
const reviewController = require('../controllers/reviewController');

// mergeParams will merge the tour params and allow access in this router

const router = express.Router({ mergeParams: true });

router.use(authenticateUser.authCheck); // make sure the user is authenticated

router
  .route('/manage-reviews')
  .get(reviewController.getAllReviews)
  .post(
    authenticateUser.validateIsAdmin('user'),
    reviewController.createReview
  );

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenticateUser.validateIsAdmin('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(
    authenticateUser.validateIsAdmin('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authenticateUser.validateIsAdmin('user', 'admin'),
    reviewController.deleteReview
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//
//     authenticateUser.validateIsAdmin('user'),
//     reviewController.createReview
//   );

module.exports = router;
