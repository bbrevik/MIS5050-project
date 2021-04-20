'use-strict';

/**
 *  This file contains all the routing for our USER Routes
 *  we call the express router function and set our router points
 *  for the paths and we can call our controller functions as needed.
 */
// first require in the modules/files
const express = require('express');

const authenticateUser = require('../controllers/authenticateUser');
// eslint-disable-next-line no-unused-vars
const reviewController = require('../controllers/reviewController');
const userController = require('../controllers/userController');

// use the express router for our CRUD calls
const router = express.Router();

router.patch('/resetPassword/:token', authenticateUser.resetPasswordRequest); // This will be how the user is able to reset the password
router.post('/forgotPassword', authenticateUser.forgotPasswordRequest); // This will send the user an email

router.post('/login', authenticateUser.login);

router.get('/logout', authenticateUser.logout);

router.use(userController.getUser);

router.use(authenticateUser.authCheck);

router.patch('/updatePassword', authenticateUser.updateUserPassword);
router.get('/me', userController.getUser, userController.getOneUser);
router.patch('/updateMe', userController.updateUser);
router.delete('/deleteMe', userController.deleteUser);

router.use(authenticateUser.validateIsAdmin('admin'));

router
  .route('/')
  .get(userController.getBLTUsers)
  .post(userController.updateUser);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteBLTUser);

// export the router so we can call this from the app file
module.exports = router;
