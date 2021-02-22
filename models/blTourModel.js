'use-strict';

const mongoose = require('mongoose');
/**
 * Schemas for the database
 * Here is where we need to declare the parts that will make up
 * the mongoose document and handel some validation.
 */

const blTourSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'Please provide a name for the tour.'],
  },
  tourDifficulty: {
    type: String,
    required: [true, 'Please state the difficulty level'],
  },
  groupSizeMax: {
    type: Number,
    required: [true, 'Please enter the maximum number of group members.'],
  },
  tourRatingAverage: { type: Number, default: 0 },
  ratingsTotal: { type: Number, default: 0 },
  price: {
    type: Number,
    required: [true, 'Please provide a price for the tour.'],
  },
  tourDiscountPrice: { type: Number },
  duration: {
    type: Number,
    required: [true, 'Please enter the duration of the trip'],
  },
  description: {
    type: String,
    trim: true,
  },
  tourSummary: {
    type: String,
    required: [true, 'Please enter a tour summary'],
    trim: true,
  },
  tourMainImageName: {
    type: String,
    required: [true, 'Please add a tour image'],
  },
  otherTourImages: [String],
  tourCreatedDate: {
    type: Date,
    default: Date.now(),
  },
  tourStartDates: [Date],
});

/**
 * This is the model we are using  in the application
 * add things to the database we create a variable create a model
 * and call the schema to add documents to the database
 */
const BLTour = mongoose.model('BLTour', blTourSchema);

module.exports = BLTour;
