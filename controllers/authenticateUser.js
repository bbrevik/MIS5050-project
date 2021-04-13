/* eslint-disable arrow-body-style */

const util = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendMail = require('../reusableCode/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION,
  });
};

const jwtCookie = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES * 86400000 // converting to milliseconds
  ),
  httpOnly: true,
};

module.exports = {
  // sign up a new user
  signup: async (req, res, next) => {
    try {
      const createdUser = await User.create(req.body);
      const userToken = signToken(createdUser.id);
      res.cookie('jwt', userToken, jwtCookie);
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
      // console.log(req.headers.authorization);
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
      // console.log(userData);

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

  updateUserPassword: async (req, res, next) => {
    try {
      // get the user
      const currentUser = await User.findById(req.user.id).select('+password');

      // verify password
      // console.log(req.body);
      if (
        !(await currentUser.checkIfPasswordIsCorrect(
          req.body.currentPassword,
          currentUser.password
        ))
      ) {
        return next(new Error('Your password is incorrect'));
      }

      // update password
      currentUser.password = req.body.password;
      currentUser.passwordConfirm = req.body.passwordConfirm;
      currentUser.passwordResetExpireDate = undefined;
      currentUser.userPasswordResetToken = undefined;
      await currentUser.save();
      console.log('here');
      // sign the currentUser in
      const newToken = signToken(currentUser._id);
      res.json({
        status: 'success',
        newToken,
      });
    } catch (error) {
      next(error);
    }
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
      res.cookie('jwt', userToken, jwtCookie);
      res.json({
        status: 'success',
        userToken,
      });
    } catch (error) {
      next(error);
    }
  },

  resetPasswordRequest: async (req, res, next) => {
    try {
      // Find the user by the token they have
      // need to compare the hashed token in the db with the unscripted one but need to hash first
      const userToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      // find the user and verify the token is valid and not expired
      const currentUser = await User.findOne({
        userPasswordResetToken: userToken,
        passwordResetExpireDate: { $gt: Date.now() }, // check if the users token is greater then current time if so token is expired
      });

      // Make sure the token is not expired and valid
      if (!currentUser) {
        return next(
          new Error('The reset request is expired. Please request again')
        );
      }

      currentUser.password = req.body.password;
      currentUser.passwordConfirm = req.body.passwordConfirm;
      currentUser.passwordResetExpireDate = undefined;
      currentUser.userPasswordResetToken = undefined;

      await currentUser.save();
      // update passwordChangedDate on the user model with the current date for the user
      // sign the user in and provide a new jwt
      const newToken = signToken(currentUser._id);
      res.cookie('jwt', userToken, jwtCookie);
      res.json({
        status: 'success',
        newToken,
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
      //  console.log(message);

      try {
        await sendMail({
          email: forgetfulUser.email,
          subject: 'Your password reset request',
          message,
        });
        res.json({
          status: 'success',
          message: 'An email was sent to the user',
        });
      } catch (error) {
        next(error);
      }
      // console.log(sendMail.email);
    } catch (error) {
      next(error);
    }
  },
};
