'use-strict';

const User = require('../models/userModel');

// this function will filter the data that is returned by looping over the object and pulling the specific fields and returning them
const filterData = (data, ...fields) => {
  const userData = {};
  Object.keys(data).forEach((item) => {
    if (fields.includes(item)) userData[item] = data[item];
  });
  return userData;
};

// this will get all the users
module.exports = {
  getBLTUsers: async (request, response, next) => {
    try {
      const users = await User.find();
      response.json({
        status: 'success',
        results: users.length,
        data: {
          users,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // This will "delete" a user account by marking accountIsActive to false.
  deleteUser: async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.user.id, { accountIsActive: false });
      res.json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  },

  // This function will allow us to update user data on the account but not to be able to update the password only the fields we add to the filterData
  // we can add to this as needed or take away
  updateUser: async (req, res, next) => {
    try {
      // check the data the user is updating
      if (req.body.password || req.body.passwordConfirm) {
        return next(new Error('You cannot update you password here'));
      }
      // filter the fields we would like the user to have access to
      const data = filterData(req.body, 'name', 'email');
      // update the user data
      const currentUser = await User.findByIdAndUpdate(req.user.id, data, {
        new: true,
        runValidators: true, // This will validate the data before a save
      });
      res.json({
        status: 'success',
        user: currentUser,
      });
      console.log(currentUser);
    } catch (error) {
      next(error);
    }
  },

  // This will return a user
  getBLTUser: (request, response) => {
    response.json({
      status: 'error',
      message: 'This route is to be defined later',
    });
  },

  createBLTUser: (request, response) => {
    response.json({
      status: 'error',
      message: 'This route is to be defined later',
    });
  },

  updateBLTUser: (request, response) => {
    response.json({
      status: 'error',
      message: 'This route is to be defined later',
    });
  },

  deleteBLTUser: (request, response) => {
    response.json({
      status: 'error',
      message: 'This route is to be defined later',
    });
  },
};
