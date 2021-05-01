const multer = require('multer');
const BLTour = require('../models/tourModel');
const User = require('../models/userModel');

// this function is for the storage. we set the storage location and what we want the file name to be
const ms = multer.diskStorage({
  destination: (req, file, fn) => {
    console.log('Storage');
    fn(null, 'public/images/users');
  },
  filename: (req, file, fn) => {
    const fileExt = file.mimetype.split('/')[1];
    const userFileName = file.originalname.split('.')[0];
    fn(null, `blt-${Date.now()}-${userFileName}.${fileExt}`);
  },
});

// this will check if the file being uploaded is an image and not another file type like csv or .txt file
const mf = (req, file, fn) => {
  // if the file being passes if a image pass true
  if (file.mimetype.startsWith('image')) {
    fn(null, true);
  } else {
    fn(new Error('the file is not an image'), false);
  }
};

// multer upload function calls the multer storage and  the file filter functions above.
const uploadImage = multer({
  storage: ms,
  fileFilter: mf,
});

// this is what we call from the router and then this function calls the above function which gets the storage and file filter.
exports.uploadImage = uploadImage.single('photo');

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

const filteredUpload = (obj, ...allow) => {
  const createNewObject = {};
  Object.keys(obj).forEach((item) => {
    if (allow.includes(item)) createNewObject[item] = obj[item];
  });
  return createNewObject;
};

exports.updateUserInfo = async (req, res, next) => {
  try {
    console.log('req.file', req.file);
    console.log('req.body', req.body);
    // console.log('updating user', req.body);

    const filterUpload = filteredUpload(req.body, 'name', 'email');
    if (req.file) filterUpload.photo = req.file.filename;

    const currentUser = await User.findByIdAndUpdate(
      req.user.id,
      filterUpload,
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
