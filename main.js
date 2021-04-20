/* eslint-disable no-param-reassign */

'use-strict';

/**
 * Modules required in for the application
 * Express-
 * app.METHOD(PATH, HANDLER)
 * app is an instance of express.
 * METHOD is an HTTP request method, in lowercase.
 * PATH is a path on the server.
 * HANDLER is the function executed when the route is matched.
 * https://expressjs.com/en/starter/basic-routing.html
 *
 * morgan-
 * This is a middleware resource for logging that will be used in the development process
 * http://expressjs.com/en/resources/middleware/morgan.html
 *
 */

/**
 * We start the app with everything we require
 * Express/Morgan see above
 *
 * tourRouter
 * userRouter
 *      - These are the routes for tours and users.
 */

const express = require('express');
const morgan = require('morgan');
// const layouts = require('express-ejs-layouts');
const path = require('path');
// const helmet = require('helmet');
// eslint-disable-next-line no-unused-vars
const cookieParser = require('cookie-parser');
// const homeController = require('./controllers/homeController');
const errorController = require('./controllers/errorController');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRouting');

const app = express();
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * This is the applications middleware functions
 * to use express to call different routes which
 * will call the controller and return some information.
 */

// helmet is used for setting http security  https://github.com/helmetjs/helmet Helmet is a collection of 14 smaller middleware(s)

// This middleware will be used for development reasons only it will log http requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 *  app.use(express.json())
 *  is a method built in express to recognize the incoming Request Object as a JSON Object
 */
app.use(express.json());
app.use(cookieParser()); // this will parse all the cookies f rom the incoming request
app.use(express.urlencoded({ extended: true }));

// This is a test middleware function
// app.use((request, response, next) => {
//   console.log('middleware being executed');
//   next();
// });

// this is a call to get the time a request was made
app.use((request, response, next) => {
  request.timeOfRequest = new Date().toISOString();
  console.log(request.cookies);

  // console.log(request.user);
  next();
});

/**
 * we are declaring paths to our routes
 */
app.use('/', viewRoutes);

app.use('/app/users', userRoutes);
app.use('/app/tours', tourRoutes);
app.use('/app/reviews', reviewRoutes);

// app.get('/', homeController.mainIndex);
// app.get('/tour', homeController.tourIndex);

// This will look at all routes that a user tries to visit and if it exists they will be redirected as usual
// otherwise they will get an error message.
app.all('*', (req, res, next) => {
  // if an error we are going to pass a sting message.
  const error = new Error(
    `Sorry, we are having trouble finding ${req.originalUrl}.`
  );
  error.status = 'failed';
  error.statusCode = 404;
  // we need to pass the error to the next so it will execute.
  next(error);
});

// middleware "error first function" to handel errors
app.use(errorController.handleErrors);

/**
 * The export module.exports = app declares we are exporting
 * this app file and in server.js we are requiring in the app
 * and starting the server.
 */

module.exports = app;
