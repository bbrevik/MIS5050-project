'use-strict';

/**
 *  This file contains all the routing for our TOUR Routes
 *  we call the express router function and set our router points
 *  for the paths and we can call our controller functions as needed.
 */
const express = require('express');

const router = express.Router();
const blTourController = require('../controllers/blTourController');

router
  .route('/')
  .get(blTourController.getAllBLTours)
  .post(blTourController.createBLTour);
router
  .route('/:id')
  .get(blTourController.getOneBLTour)
  .patch(blTourController.updateBLTour)
  .delete(blTourController.deleteBLTour);

// router.param('id', blTourController.checkID);

router.route('/blTour-stats').get(blTourController.getBucketListStats);
router.route('/overview/:year').get(blTourController.getOverview);
router
  .route('/best-tours')
  .get(blTourController.bltTopTours, blTourController.getAllBLTours);

module.exports = router;
