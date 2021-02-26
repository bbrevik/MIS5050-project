'use-strict';

/**
 * Mongoose-
 * is a object data modeling library for node.js and mongoDB
 * it provides a higher level of abstraction and allows us to create schemas
 * to model data and relationships. Mongoose schema is where we will model our data values and validation
 * the mongoose model is a wrapper for the schema providing the interface for the CRUD operations
 */

/**
 * dotenv-
 * The dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
 * Storing configuration in the environment separate from code is based on the Twelve-Factor App methodology
 * https://zetcode.com/javascript/dotenv/
 */

/**
 * app-
 * We are requiring in the app.js file to have access the app
 * and so we can keep our server separate from the app/middleware
 * we are declaring the variable app and requiring in the path to the app.js file
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// This is the path to our dotenv configuration file
dotenv.config({ path: './config.env' });
const app = require('./main');

/**
 * declaring our database string -> DB.
 * process.env.DATABASE pulls in the database string from the config file
 * .replace(<PASSWORD>), process.env.DATABASE_PASSWORD - This replaces the <password> portion set
 * in the database string with the password in the file for DATABASE_PASSWORD
 *
 */
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

/**
 * We are using mongoose to connect to the database passing the variable DB we created above followed
 * by some options to fix different deprecation warnings
 * https://mongoosejs.com/docs/deprecations.html
 */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connection was successful');
  });

// console.log(app.get('env'));
// console.log(process.env);
// console.log(process.env.NODE_ENV);
/**
 * declaring our port being set to what we have set for process.env.PORT
 * or 3000 and logging a message to the console if it is running.
 */

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
