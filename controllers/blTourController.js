/**
 *
 * CRUD operations with mongoose
 * https://mongoosejs.com/docs/queries.html
 */

const BLTour = require('../models/blTourModel');

exports.getAllBLTours = async (request, response) => {
  try {
    // {filtering} Here is where we need to build the query
    const queryObject = { ...request.query }; // get a copy/ new object of the request.query object
    const fieldsToExclude = ['page', 'sort', 'limit', 'fields']; // these are the fields we need to exclude
    fieldsToExclude.forEach((item) => delete queryObject[item]); // removing all the fields from the object looping over if it exist
    console.log(request.query);
    console.log(queryObject);

    // {better filtering} gte, gt, let, lt need to be handled
    let toursString = JSON.stringify(queryObject);
    toursString = toursString.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (matchedValue) => `$${matchedValue}`
    );
    console.log(JSON.parse(toursString));
    const builtQuery = BLTour.find(JSON.parse(toursString));

    // This is where the query is executed
    const allBLTours = await builtQuery;
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

    response.json({
      status: 'success',
      results: allBLTours.length,
      data: {
        tours: allBLTours,
      },
    });
  } catch (error) {
    console.log('Getting all tours failed');
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
    console.log('finding single tour failed');
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
