'use-strict';

/**
 *  This file contains all the routing for our USER Routes
 *  we call the express router function and set our router points
 *  for the paths and we can call our controller functions as needed.
 */
// first require in the modules/files
const express = require('express');
const authenticateUser = require('../controllers/authenticateUser');
const userController = require('../controllers/userController');

// use the express router for our CRUD calls
const router = express.Router();

router.patch('/resetPassword/:token', authenticateUser.resetPasswordRequest); // This will be how the user is able to reset the password
router.post('/forgotPassword', authenticateUser.forgotPasswordRequest); // This will send the user an email
router.patch(
  '/updatePassword',
  authenticateUser.authCheck,
  authenticateUser.updateUserPassword
);

router.post('/signup', authenticateUser.signup);
router.post('/login', authenticateUser.login);

router
  .route('/')
  .get(userController.getBLTUsers)
  .post(userController.createBLTUser);
router
  .route('/:id')
  .get(userController.getBLTUser)
  .patch(userController.updateBLTUser)
  .delete(userController.deleteBLTUser);

// export the router so we can call this from the app file
module.exports = router;
