const mongoose = require('mongoose');
const BLTour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      required: [true, 'Please add a review'],
      type: String,
    },
    reviewDate: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
    tour: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BLTour',
    },
    user: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Here we are setting up indexing on the mongoDB so a user can add 1 review per tour
// We are doing this as if we mark the tour model as unique for a review then only one review can be added to a tour
// to fix that we need to set indexing
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// This will calculate the average ratings for a tour
reviewSchema.statics.averageRatings = async function (tourId) {
  const statistics = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numberOfRatings: { $sum: 1 }, // getting the number of ratings
        averageRating: { $avg: '$rating' }, // looking at the rating field in the model and averaging it out
      },
    },
  ]);
  // console.log(statistics);
  if (statistics.length > 0) {
    await BLTour.findByIdAndUpdate(tourId, {
      ratingsQuantity: statistics[0].numberOfRatings,
      ratingsAverage: statistics[0].averageRating,
    });
  } else {
    // so if no statistics then set rating average to 4
    await BLTour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4,
    });
  }
};
// this is to calculate the average rating
reviewSchema.post('save', function () {
  // need to get the tour
  this.constructor.averageRatings(this.tour);
});

// this is how we are getting the current document from the database store it on the this.tourReview variable then execute / go to post below this function
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.tourReview = await this.findOne();
  next();
});

// This is where the calculation is actually done and where we pass the this.tourReview to be executed
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() would not work at the function would have executed which is why we need the pre hook above
  await this.tourReview.constructor.averageRatings(this.tourReview.tour);
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;
