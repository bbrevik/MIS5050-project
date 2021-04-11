/* eslint-disable arrow-body-style */
const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendEmailToUser = require('../reusableCode/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION,
  });
};

module.exports = {
  // sign up a new user
  signup: async (req, res, next) => {
    try {
      const createdUser = await User.create(req.body);
      const userToken = signToken(createdUser.id);
      res.json({
        status: 'success',
        userToken,
        data: {
          user: createdUser,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  authCheck: async (req, res, next) => {
    try {
      // See if the user has a token
      let usersToken;
      console.log(req.headers.authorization);
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        usersToken = req.headers.authorization.split(' ')[1];
      }

      if (!usersToken) {
        return next(
          new Error('You are not logged in! Please log in to get access.')
        );
      }

      // Verification if the users token is expired
      const userData = await util.promisify(jwt.verify)(
        usersToken,
        process.env.JWT_SECRET
      );
      console.log(userData);

      // Check to see if the user is in the database
      const loggedInUser = await User.findById(userData.id);
      if (!loggedInUser) {
        return next(new Error('The user no longer exists in the database.'));
      }

      // Check to see if the user has changed their password after the token was created
      // iat is issued at so the userData issued at
      if (loggedInUser.passwordChangedAfterToken(userData.iat)) {
        return next(new Error('The users password was changed. Please login.'));
      }

      // The user should have access to the route
      req.user = loggedInUser;
      next();
    } catch (error) {
      next(error);
    }
  },

  validateIsAdmin: (...role) => {
    return (req, res, next) => {
      // check if user is admin type
      if (!role.includes(req.user.role)) {
        return next(new Error('You cannot perform that action.'));
      }
      next();
    };
  },

  login: async (req, res, next) => {
    try {
      const { email } = req.body; // eslint was throwing a warning to use destructuring. so, when you declare the const 'email' in {} is the same as req.body.email or req.body.password
      const { password } = req.body;

      // check the database for email and password
      if (!email || !password) {
        return next(new Error('Please enter an email and password.'));
      }
      // See if email and password is correct
      const user = await User.findOne({ email }).select('+password');
      const correctPassword = await user.checkIfPasswordIsCorrect(
        password,
        user.password
      );

      if (!user || !correctPassword) {
        return next(new Error('The email or password if not correct.'));
      }
      // send web token is everything passes
      const userToken = signToken(user._id);
      res.json({
        status: 'success',
        userToken,
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPasswordRequest: async (req, res, next) => {
    try {
      // get the user from the email provided
      const forgetfulUser = await User.findOne({ email: req.body.email });
      if (!forgetfulUser) {
        return next(new Error('No user with that email exists.'));
      }
      // create a reset pass token
      const usersResetToken = forgetfulUser.passwordResetTokenForUser();
      // this will ignore any validators specified in the schema
      await forgetfulUser.save({ validateBeforeSave: false });
      // send it to the user
      const resetPasswordURL = `${req.protocol}://${req.get(
        'host'
      )}/app/users/resetPassword/${usersResetToken}`;

      const message = `Please submit your request for a new password at: ${resetPasswordURL}`;

      try {
        await sendEmailToUser({
          email: forgetfulUser.email,
          subject: 'Your password reset request',
          message,
        });
        res.json({
          status: 'success',
          message: 'An email was sent to the user',
        });
      } catch (error) {
        forgetfulUser.passwordResetTokenForUser = undefined;
        forgetfulUser.passwordResetExpireDate = undefined;
        await forgetfulUser.save({ validateBeforeSave: false });

        return next(new Error('Error sending email'));
      }
    } catch (error) {
      next(error);
    }
  },
  resetPasswordRequest: (req, res, next) => {},
};
