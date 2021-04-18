const BLTour = require('../models/tourModel');

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

exports.tourPage = (req, res) => {
  res.render('tour', {
    title: 'The forest Hiker',
  });
};
