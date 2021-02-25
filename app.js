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
 * blTourRouter
 * blUserRouter
 *      - These are the routes for tours and users.
 */

const express = require('express');
const morgan = require('morgan');
// const layouts = require('express-ejs-layouts');
const path = require('path');

const blTourRouter = require('./routes/blTourRoutes');
const blUserRouter = require('./routes/blUserRoutes');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

/**
 * This is the applications middleware functions
 * to use express to call different routes which
 * will call the controller and return some information.
 */

// This middleware will be used for development reasons only it will log http requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 *  app.use(express.json())
 *  is a method built in express to recognize the incoming Request Object as a JSON Object
 */
app.use(express.json());

// This is a test middleware function
app.use((request, response, next) => {
  console.log('Hello from the middleware');
  next();
});

// this is a call to get the time a request was made
app.use((request, response, next) => {
  request.timeOfRequest = new Date().toISOString();
  next();
});

/**
 * we are declaring paths to our routes
 */
app.get('/', (req, res) => {
  // res.send("Hello world!...");
  res.render('index');
});

app.use('/app/users', blUserRouter);
app.use('/app/tours', blTourRouter);

/**
 * The export module.exports = app declares we are exporting
 * this app file and in server.js we are requiring in the app
 * and starting the server.
 */
module.exports = app;
