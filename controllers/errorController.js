/* eslint-disable no-param-reassign */
module.exports = {
  handleErrors: (error, req, res, next) => {
    // if 404 or failed send error
    error.status = error.status || 'error';
    // we want the status or an internal service error
    error.statusCode = error.statusCode || 500;
    // response to the client. This will read from the above function.
    // we want to handel errors of all types
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  },
};
