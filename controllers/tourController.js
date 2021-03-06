'use-strict';

/**
 *
 * CRUD operations with mongoose
 * https://mongoosejs.com/docs/queries.html
 */

const BLTour = require('../models/tourModel');
const APIProperties = require('../reusableCode/apiProperties');
// eslint-disable-next-line no-unused-vars
const User = require('../models/userModel');

exports.bltTopTours = async (request, response, next) => {
  request.query.limit = '3';
  request.query.sort = '-tourRatingAverage';
  request.query.fields =
    'name, tourRatingAverage, price, tourSummary, difficulty';
  next();
};

exports.bltCheapTours = async (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = 'price';
  request.query.fields =
    'name, price,tourSummary, tourRatingAverage,  difficulty';
  next();
};

exports.getAllBLTours = async (request, response, next) => {
  // This is a one way to build a query
  // const allBLTours = await BLTour.find({
  //   duration: 5,
  //   difficulty: 'hard',
  // })
  // This is mongooses way of building queries
  // const allBLTours = await BLTour.find()
  //   .where('name')
  //   .equals(value)
  //   .where('difficulty')
  //   .equals('medium');
  try {
    // Going to create a new object using mongooses building queries and then return in from the api properties class

    const bltProperty = new APIProperties(BLTour.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // allBLTours will wait until the property is built then pass it to the variable allBLTours
    const allBLTours = await bltProperty.bltQuery.populate('guides');
    response.json({
      status: 'success',
      results: allBLTours.length,
      data: {
        tours: allBLTours,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getThreeBLTours = async (request, response, next) => {
  try {
    // Going to create a new object using mongooses building queries and then return in from the api properties class

    const bltProperty = new APIProperties(BLTour.find(), request.query)
      .filter()
      .sort()

      .paginate();

    // allBLTours will wait until the property is built then pass it to the variable allBLTours
    const tours = await bltProperty.bltQuery.populate('guides');
    response.render('top-three', {
      tours,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCheapFiveTours = async (request, response, next) => {
  try {
    // Going to create a new object using mongooses building queries and then return in from the api properties class

    const bltProperty = new APIProperties(BLTour.find(), request.query)
      .filter()
      .sort()
      .paginate();

    // allBLTours will wait until the property is built then pass it to the variable allBLTours
    const tours = await bltProperty.bltQuery.populate('guides');
    response.render('top-three', {
      tours,
    });
  } catch (error) {
    next(error);
  }
};

// https://docs.mongodb.com/manual/reference/operator/query/geoWithin/
// this will find documents within a specific distance using geolocation
exports.getWithinDist = async (req, res, next) => {
  //  '/toursWithin/:dis/center/:userLocation/unit/:unit'
  try {
    const { dis, userLocation, unit } = req.params;
    userLocation.split(',');
    const [latitude, longitude] = userLocation.split(',');

    const radius = unit === 'mi' ? dis / 3963.2 : dis / 6378.1;

    if ((!latitude, !longitude)) {
      return next(new Error('You do not have the location entered correctly.'));
    }

    const tours = await BLTour.find({
      startingPoint: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
      },
    });

    res.json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.overviewTopThree = async (req, res, next) => {
  try {
    // get the data
    const bltours = await BLTour.find();
    res.render('top-three', {
      title: 'All Tours',
      tours: bltours,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDistanceToTours = async (req, res, next) => {
  try {
    // '/distances/:userLocation/unit/:unit'
    const { userLocation, unit } = req.params;
    userLocation.split(',');
    const [latitude, longitude] = userLocation.split(',');
    // depending on unit type convert mi or km
    const distFix = unit === 'mi' ? 0.000621371 : 0.001;

    if ((!latitude, !longitude)) {
      return next(
        new Error(
          'There is something wrong with the location coordinates you entered.'
        )
      );
    }

    const distances = await BLTour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude * 1, latitude * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: distFix,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.json({
      status: 'success',

      data: {
        data: distances,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOneBLTour = async (request, response, next) => {
  try {
    const findTour = await BLTour.findById(request.params.id)
      .populate('guides')
      .populate('reviews');

    if (!findTour) {
      response.render('errors/404');
    }

    response.json({
      status: 'success',
      data: {
        tour: findTour,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * we could use BLTour.create({}).then but we can use the
 * async await to send the request and wait for the response
 * after the response is sent store it in a variable and then use
 * the variable to create the document.
 *
 */

exports.createBLTour = async (request, response, next) => {
  try {
    const createNewTour = await BLTour.create(request.body);
    response.json({
      status: 'success',
      data: {
        tour: createNewTour,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBLTour = async (request, response, next) => {
  try {
    const updateSingleTour = await BLTour.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updateSingleTour) {
      response.render('errors/404');
    }

    response.json({
      status: 'success',
      data: {
        tour: updateSingleTour,
      },
    });
  } catch (error) {
    next(error);
  }
};

// delete a tour function

exports.deleteBLTour = async (request, response, next) => {
  try {
    const deleteTour = await BLTour.findByIdAndDelete(request.params.id);

    if (!deleteTour) {
      response.render('errors/404');
    }

    response.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * https://docs.mongodb.com/manual/aggregation/
 * https://docs.mongodb.com/manual/reference/operator/aggregation/match/
 * Filters the documents to pass only the documents that match the specified condition(s) to the next pipeline stage.
 *
 * https://docs.mongodb.com/manual/reference/operator/aggregation/group/
 * Groups input documents by the specified _id expression and for each distinct grouping, outputs a document.
 * The _id field of each output document contains the unique group by value. The output documents can also
 * contain computed fields that hold the values of some accumulator expression.
 *
 * mongoDB aggregation
 * The aggregation pipeline is a framework for data aggregation
 * modeled on the concept of data processing pipelines. Documents
 * enter a multi-stage pipeline that transforms the documents into aggregated results. For example:
 */

exports.getBucketListStats = async (request, response, next) => {
  try {
    const statistics = await BLTour.aggregate([
      {
        // select documents >= 4
        $match: { tourRatingAverage: { $gte: 4 } },
      },
      {
        $group: {
          // this allows us to calculate averages
          _id: { $toUpper: '$tourDifficulty' },
          numberOfTours: { $sum: 1 },
          numberOfRatings: { $sum: '$ratingsTotal' },
          averageRating: { $avg: '$tourRatingAverage' },
          averagePrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
        },
      },
      {
        $sort: { averagePrice: 1 },
      },
    ]);
    response.json({
      status: 'success',
      data: {
        statistics,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/
 *
 * I am going to use the unwind aggregation to get all the tour dates into
 * its own document.
 * we can use match to get the dates between the beginning of the year
 * and the end of the year by using the greater then first day of year, less then
 * last day of year
 * order 1 ascending -1 descending
 */

exports.getOverview = async (request, response, next) => {
  try {
    const year = request.params.year * 1;
    const overview = await BLTour.aggregate([
      {
        $unwind: '$tourStartDates',
      },
      {
        $match: {
          tourStartDates: {
            $gte: new Date(`01-01-${year}`),
            $lte: new Date(`12-31-${year}`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$tourStartDates' },
          count: { $sum: 1 },
          tourResults: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    response.json({
      status: 'success',
      results: overview.length,
      data: {
        overview,
      },
    });
  } catch (error) {
    next(error);
  }
};
