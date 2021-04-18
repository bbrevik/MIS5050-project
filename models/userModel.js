const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator'); // used to check custom validations
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your preferred email'],
    lowercase: true, // convert to lowercase
    unique: true, // We will use emails to validate a user
    validate: [
      validator.isEmail, // check if email being submitted is valid
      'The email address you entered is not valid. Please enter a valid email address.',
    ],
  },

  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false, // this will make it so the password is not returned in any output
  },
  passwordConfirm: {
    type: String,
    required: [false, 'Please confirm your password'],
    validate: {
      // The function below will only work on a save
      validator: function (passwordEntered) {
        // function to confirm that the password entered is hte same as the confirm
        return passwordEntered === this.password; // basically if password === to password confirm return boolean and only works on a save or create this will not validate on an update
      },
      message: 'The passwords provided are not the same.',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'guide-admin'],
    default: 'user',
  },
  passwordResetExpireDate: Date,
  passwordChangedDate: Date,
  userPasswordResetToken: String,

  accountIsActive: {
    type: Boolean,
    select: false,
    default: true,
  },
});

// this saves the data before it is saved to the database
userSchema.pre('save', async function (next) {
  // if the password is modified run below function
  if (!this.isModified('password')) return next(); // if hte password has not been modified return from the function and call next

  // encrypt the password with cost of 12 using bcryptjs
  this.password = await bcrypt.hash(this.password, 10); // this.password is what we are going to hash/encrypt the 10 is the salt/length of the hash and how CPU intensive it is

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// this is a function that will run before it is saved
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedDate = Date.now() - 5000;
  next();
});

// this is query middleware so the 'this' keyword will execute on the query calling it
userSchema.pre(/^find/, function (next) {
  // we only want to return the items that are marked active
  this.find({ accountIsActive: { $ne: false } });
  next();
});

userSchema.methods.checkIfPasswordIsCorrect = async function (
  plainTextPass,
  usersHashedPass
) {
  return await bcrypt.compare(plainTextPass, usersHashedPass); // we are going hash the plainTextPass and compare to the userHashedPass in the db
};

userSchema.methods.passwordChangedAfterToken = function (JWTTimestamp) {
  // getting the date when the password was changed
  if (this.passwordChangedDate) {
    // need to compare the two dates so setting the set date from the model to milliseconds to compare with the JWTTimestamp /1000, and it is of base 10
    const formatPasswordChangedDate = parseInt(
      this.passwordChangedDate.getTime() / 1000,
      10
    );
    // returning the result if the timestamp from JWTTimestamp is less than the date in the database if false return false else return true
    return JWTTimestamp < formatPasswordChangedDate;
  }

  // return false if the password was not changed
  return false;
};

// this method will be used to send a password reset token for a forgotten password
userSchema.methods.passwordResetTokenForUser = function () {
  const userResetToken = crypto.randomBytes(64).toString('hex'); // this creates a reset token but is not hashed

  this.userPasswordResetToken = crypto // this will allow us to hash the token using crypto a node built in module
    .createHash('sha256')
    .update(userResetToken)
    .digest('hex');

  this.passwordResetExpireDate = Date.now() + 30 * 60 * 1000; // 30minutes to reset the password.
  // send the reset token to the user
  return userResetToken;
};

const User = mongoose.model('User', userSchema, 'bltusers');

module.exports = User;
