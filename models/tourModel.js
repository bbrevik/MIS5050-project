'use-strict';

const mongoose = require('mongoose');

/**
 * slugify
 * Weekly Downloads 1,424,048
 */
const slugify = require('slugify');
// eslint-disable-next-line no-unused-vars
const User = require('./userModel');
/**
 * Schemas for the database
 * Here is where we need to declare the parts that will make up
 * the mongoose document and handel some validation.
 */

const blTourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Please provide a name for the tour.'],
    },
    tourDifficulty: {
      type: String,
      required: [true, 'Please state the difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
      },
    },
    guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groupSizeMax: {
      type: Number,
      required: [true, 'Please enter the maximum number of group members.'],
    },
    tourRatingAverage: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
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
    startingPoint: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      address: String,
      description: String,
      coordinates: [Number],
    },
    allLocations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    vipTour: {
      type: Boolean,
      default: false,
    },

    tourMainImageName: {
      type: String,
      required: [true, 'Please add a tour image'],
    },
    slug: String,
    otherTourImages: [String],
    tourCreatedDate: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tourStartDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blTourSchema.index({ startingPoint: '2dsphere' });

blTourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

/**
 * https://github.com/makwanakishan/CRUD-operation/blob/c9f1713fa5b4d1dcea86a2ed85643e664f597b9e/models/tourModel.js#L136
 * https://mongoosejs.com/docs/middleware.html
 *
 * https://www.codota.com/code/javascript/functions/slugify/slugify
 *
 *
 * // DOCUMENT MIDDLEWARE: runs before .save() and .create()
 *
 * */

blTourSchema.pre('save', function (next) {
  // results from postman "slug": "tour-17", for tour 17
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ********************************/
// QUERY MIDDLEWARE THIS will point at the current query not the current document like the document middleware
//
// https://github.com/makwanakishan/CRUD-operation/blob/c9f1713fa5b4d1dcea86a2ed85643e664f597b9e/models/tourModel.js#L136
// tourSchema.pre('find', function(next) {
// tourSchema.pre(/^find/, function(next) { // this is a regular expression that will target all items with 'find' find,findOne..
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });

blTourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// This will allow to populate the guides on the tour page
blTourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
  });
  next();
});

/**
 * This is the model we are using  in the application
 * add things to the database we create a variable create a model
 * and call the schema to add documents to the database
 */
const BLTour = mongoose.model('BLTour', blTourSchema, 'bltours');
module.exports = BLTour;
