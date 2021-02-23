'use-strict';

/**
 *
 * CRUD operations with mongoose
 * https://mongoosejs.com/docs/queries.html
 */

const BLTour = require('../models/blTourModel');
const APIProperties = require('../reusableCode/apiProperties');

exports.bltTopTours = async (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-tourRatingAverage, price';
  request.query.fields =
    'name, price, tourRatingAverage, tourSummary, difficulty';
  next();
};

exports.getAllBLTours = async (request, response) => {
  // This is a simple way to build a query
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
    const allBLTours = await bltProperty.bltQuery;
    response.status(200).json({
      status: 'success',
      results: allBLTours.length,
      data: {
        tours: allBLTours,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getOneBLTour = async (request, response) => {
  try {
    const findTour = await BLTour.findById(request.params.id);
    response.json({
      status: 'success',
      data: {
        tour: findTour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

/**
 *
 * @param {*} request
 * @param {*} response
 *
 * we could use BLTour.create({}).then but we can use the
 * async await to send the request and wait for the response
 * after the response is sent store it in a variable and then use
 * the variable to create the document.
 *
 */

exports.createBLTour = async (request, response) => {
  try {
    const createNewTour = await BLTour.create(request.body);
    response.status(201).json({
      status: 'success',
      data: {
        tour: createNewTour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.updateBLTour = async (request, response) => {
  try {
    const updateSingleTour = await BLTour.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );
    response.status(200).json({
      status: 'success',
      data: {
        tour: updateSingleTour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.deleteBLTour = async (request, response) => {
  try {
    await BLTour.findByIdAndDelete(request.params.id);
    response.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    });
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

exports.getBucketListStats = async (request, response) => {
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
    response.status(200).json({
      status: 'success',
      data: {
        statistics,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};
