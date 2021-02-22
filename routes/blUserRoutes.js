'use-strict';

/**
 *  This file contains all the routing for our USER Routes
 *  we call the express router function and set our router points
 *  for the paths and we can call our controller functions as needed.
 */
// first require in the modules/files
const express = require('express');
const blUserController = require('../controllers/blUserController');

// use the express router for our CRUD calls
const router = express.Router();

router
  .route('/')
  .get(blUserController.getBLTUsers)
  .post(blUserController.createBLTUser);
router
  .route('/:id')
  .get(blUserController.getBLTUser)
  .patch(blUserController.updateBLTUser)
  .delete(blUserController.deleteBLTUser);

// export the router so we can call this from the app file
module.exports = router;
