const BLTour = require('../models/tourModel');
const User = require('../models/userModel');

exports.loginPage = (req, res, next) => {
  res.render('login', {
    title: 'Login',
  });
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

exports.tourPage = async (req, res, next) => {
  try {
    const bltour = await BLTour.findOne({ slug: req.params.slug }).populate({
      path: 'review',
      fields: 'user rating review',
    });
    // console.log(bltour);
    res.set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    );

    res.render('tour', {
      title: `${bltour.name} Tour`,
      bltour,
    });
  } catch (error) {
    next(error);
  }
};
