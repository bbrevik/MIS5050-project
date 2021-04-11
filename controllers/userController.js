'use-strict';

const User = require('../models/userModel');

exports.getBLTUsers = async (request, response, next) => {
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
};

exports.getBLTUser = (request, response) => {
  response.json({
    status: 'error',
    message: 'This route is to be defined later',
  });
};

exports.createBLTUser = (request, response) => {
  response.json({
    status: 'error',
    message: 'This route is to be defined later',
  });
};

exports.updateBLTUser = (request, response) => {
  response.json({
    status: 'error',
    message: 'This route is to be defined later',
  });
};

exports.deleteBLTUser = (request, response) => {
  response.json({
    status: 'error',
    message: 'This route is to be defined later',
  });
};
