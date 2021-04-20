const BLTour = require('../models/tourModel');
const User = require('../models/userModel');

exports.loginPage = (req, res, next) => {
  res.render('login');
};

exports.overviewPage = async (req, res, next) => {
  try {
    // get the data
    const bltours = await BLTour.find();
    res.render('overview', {
      title: 'All Tours',
      tours: bltours,
    });
  } catch (error) {
    next(error);
  }
};

exports.manageUsersInfo = async (req, res, next) => {
  try {
    const users = await User.find();
    res.render('manageUsers', {
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserInfo = async (req, res, next) => {
  try {
    // console.log('updating user', req.body);
    const currentUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    console.log('Name: ', currentUser.email);
    console.log('id: ', currentUser.name);

    res.render('settings', {
      user: currentUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.signupPage = async (req, res, next) => {
  res.render('signup');
};

exports.userAccount = async (req, res, next) => {
  res.render('settings');
};

exports.tourPage = async (req, res, next) => {
  try {
    const bltour = await BLTour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: '',
    });
    // console.log(bltour);

    res.render('tour', {
      title: `${bltour.name}`,
      bltour,
    });
  } catch (error) {
    next(error);
  }
};
