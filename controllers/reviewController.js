const Review = require('../models/reviewModel');
const APIProperties = require('../reusableCode/apiProperties');
// const crud = require('./crudController');

module.exports = {
  getAllReviews: async (req, res, next) => {
    try {
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      const reviewProperty = new APIProperties(Review.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const getAllReviews = await reviewProperty.bltQuery
        .populate('tour')
        .populate('user');

      res.json({
        status: 'success',
        results: getAllReviews.length,
        data: {
          getAllReviews,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (request, response, next) => {
    try {
      const item = await Review.findByIdAndDelete(request.params.id);

      if (!item) {
        response.render('errors/404');
      }

      response.json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  updateReview: async (request, response, next) => {
    try {
      const item = await Review.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!item) {
        response.render('errors/404');
      }

      response.json({
        status: 'success',
        data: {
          tour: item,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  createReview: async (req, res, next) => {
    try {
      console.log('here');
      if (!req.body.tour) req.body.tour = req.params.tourId;
      if (!req.body.user) req.body.user = req.user.id;
      const createNewReview = await Review.create(req.body);

      res.json({
        status: 'success',
        data: {
          review: createNewReview,
        },
      });
    } catch (error) {
      console.log('Error on create review');
      next(error);
    }
  },
  getOneReview: async (request, response, next) => {
    try {
      const item = await Review.findById(request.params.id)
        .populate('guides')
        .populate('reviews');

      if (!item) {
        response.render('errors/404');
      }

      response.json({
        status: 'success',
        data: {
          tour: item,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
