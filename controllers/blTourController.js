/**
 *
 * CRUD operations with mongoose
 * https://mongoosejs.com/docs/queries.html
 */

const BLTour = require('../models/blTourModel');

exports.getAllBLTours = async (request, response) => {
  try {
    const allBLTours = await BLTour.find();
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
