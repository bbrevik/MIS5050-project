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
const crud = require('./crudController');

exports.bltTopTours = async (request, response, next) => {
  request.query.limit = '10';
  request.query.sort = '-tourRatingAverage, price';
  request.query.fields =
    'name, price, tourRatingAverage, tourSummary, difficulty';
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

exports.deleteBLTour = crud.deleteItem(BLTour);

// exports.deleteBLTour = async (request, response, next) => {
//   try {
//     const deleteTour = await BLTour.findByIdAndDelete(request.params.id);

//     if (!deleteTour) {
//       response.render('errors/404');
//     }

//     response.json({
//       status: 'success',
//       data: null,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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
