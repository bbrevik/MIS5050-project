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

exports.tourPage = async (req, res, next) => {
  try {
    const bltour = await BLTour.findOne({ slug: req.params.slug }).populate({
      path: 'review',
      fields: 'user rating review',
    });
    console.log(bltour);

    res.render('tour', {
      title: `${bltour.name} Tour`,
      bltour,
    });
  } catch (error) {
    next(error);
  }
};
