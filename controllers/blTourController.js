'use-strict';

/**
 *
 * CRUD operations with mongoose
 * https://mongoosejs.com/docs/queries.html
 */

const BLTour = require('../models/blTourModel');
const APIProperties = require('../utilities/apiProperties');

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
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err,
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
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err,
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
    response.json({
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
    console.log(error);
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
    console.log('Could not delete');
  }
};
