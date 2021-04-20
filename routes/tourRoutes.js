'use-strict';

/**
 *  This file contains all the routing for our TOUR Routes
 *  we call the express router function and set our router points
 *  for the paths and we can call our controller functions as needed.
 */
const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateUser = require('../controllers/authenticateUser');
// eslint-disable-next-line no-unused-vars
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

// console.log('at tourId/review'); Mounting a path from the tour routes to the review router
router.use('/:tourId/reviews', reviewRouter);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authenticateUser.authCheck,
//     authenticateUser.validateIsAdmin('user'),
//     reviewController.createReview
//   );

router.route('/tour-stats').get(tourController.getBucketListStats);
router
  .route('/top-three')
  .get(tourController.bltTopTours, tourController.getAllBLTours);

router
  .route('/cheap-five')
  .get(tourController.bltCheapTours, tourController.getAllBLTours);

router
  .route('/distances/:userLocation/unit/:unit')
  .get(tourController.getDistanceToTours);
router
  .route('/toursWithin/:dis/center/:userLocation/unit/:unit')
  .get(tourController.getWithinDist);

router
  .route('/manage-tours')
  .get(tourController.getAllBLTours)
  .post(tourController.createBLTour);

router
  .route('/')
  .get(tourController.getAllBLTours)
  .post(tourController.createBLTour);
router
  .route('/:id')
  .get(tourController.getOneBLTour)
  .patch(
    authenticateUser.authCheck,
    authenticateUser.validateIsAdmin('admin', 'guide-admin'),
    tourController.updateBLTour
  )
  .delete(
    authenticateUser.authCheck,
    authenticateUser.validateIsAdmin('admin', 'guide-admin'),
    tourController.deleteBLTour
  );

// router.param('id', tourController.checkID);

router.route('/blTour-stats').get(tourController.getBucketListStats);
router.route('/overview/:year').get(tourController.getOverview);
router
  .route('/best-tours')
  .get(tourController.bltTopTours, tourController.getAllBLTours);

module.exports = router;
