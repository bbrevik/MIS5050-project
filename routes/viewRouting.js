'use-strict';

/**
 *  This file contains all the routing for our view Routes
 *  we call the express router function and set our router points
 *  for the paths and we can call our controller functions as needed with get.
 */

const express = require('express');
// const authenticateUser = require('../controllers/authenticateUser');

const router = express.Router();

const homeController = require('../controllers/homeController');

// router.use(authenticateUser.isUserLoggedIn);

router.get('/', homeController.overviewPage);
router.get('/tour/:slug', homeController.tourPage);
router.get('/login', homeController.loginPage);

module.exports = router;
