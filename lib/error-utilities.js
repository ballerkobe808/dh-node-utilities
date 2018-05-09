'use strict';

// dependencies.
const responseUtilities = require('./response-utilities');

// logger reference.
var logger = null;

/**
 * setter function for the custom logger.
 * @param loggerRef - Reference to the custom logger.
 */
exports.setLogger = function (loggerRef) {
  logger = loggerRef;
};

/**
 * Writes a log message.
 * @param error - The custom error object.
 */
function writeLog(error) {
  if (logger) {
    logger.error(error.message);

    if (error.err) {
      logger.error(error.err.message);
      logger.error(error.err.stack);
    }
  }
  else {
    console.error(error.message);

    if (error.err) {
      console.error(error.err.message);
      console.error(error.err.stack);
    }
  }
}

/**
 * Builds an error object with the specified information.
 * @param message
 * @param httpStatus
 * @param statusCode
 * @param [err] - An error object if one was passed.
 * @param [errorCode] - An error code if one was passed.
 * @param [ignoreLogging] - Flag indicating if we want to hide this in the logs.
 * @returns {Error}
 */
function CustomError(message, httpStatus, statusCode, err, errorCode, ignoreLogging) {
  let error = new Error(message ? message : '[Error Message Not Provided]');
  error.customError = true;
  error.httpStatus = httpStatus ? httpStatus : null;
  error.statusCode = statusCode ? statusCode : null;
  error.err = err ? err : null;
  error.errorCode = errorCode ? errorCode : null;
  error.ignoreLogging = ignoreLogging ? ignoreLogging : false;
  return error;
}

/**
 * Creates a new custom error object.
 */
exports.createError = function (message, httpStatus, statusCode, err, errorCode, ignoreLogging) {
  return new CustomError(message, httpStatus, statusCode, err, errorCode, ignoreLogging);
};

/**
 * Error handler route.
 * Add this to the express routes at the end.
 * @param err
 * @param req
 * @param res
 * @param next
 */
exports.handler = function (err, req, res, next) {
  // Check if the error object is an object we created.
  if (!err.customError) {
    return next(err);
  }

  // write a log entry.
  if (!err.ignoreLogging) {
    writeLog(err);
  }

  // send the error response.
  let responseObject = responseUtilities.buildResponseObject(err.statusCode, null, err.message, ((err.err) ? err.err.message : null), err.errorCode);
  responseUtilities.sendJSONResponse(res, responseObject, err.httpStatus);
};