'use strict';

// dependencies.
var statusCodes = require('./constants/status-codes');
var responseUtilities = require('./response-utilities');
var stringUtilities = require('./string-utilities');
var util = require('util');

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
      logger.error(error.err.stack);
    }
  }
  else {
    util.log(error.message);

    if (error.err) {
      util.log(error.err.stack);
    }
  }
}

/**
 * Builds an error object with the specified information.
 * @param errorType
 * @param messageType
 * @param message
 * @param httpStatus
 * @param statusCode
 * @param [err] - An error object if one was passed.
 * @param [errorCode] - An error code if one was passed.
 * @returns {Error}
 */
function CustomError(errorType, messageType, message, httpStatus, statusCode, err, errorCode) {
  var error = new Error(errorType);
  error.messageType = messageType;
  error.message = message;
  error.httpStatus = httpStatus;
  error.statusCode = statusCode;
  error.customError = true;

  // if there's an error present add it to the error object.
  if (err) {
    error.err = err;
  }

  if (errorCode) {
    error.errorCode = errorCode;
  }

  return error;
}

/**
 * Creates a new custom error object.
 */
exports.createError = function (errorType, messageType, message, httpStatus, statusCode, err, errorCode) {
  return new CustomError(errorType, messageType, message, httpStatus, statusCode, err, errorCode);
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
  writeLog(err);

  // send the error response.
  var responseObject = responseUtilities.buildResponseObject(err.statusCode, null, err.message, ((err.err) ? err.err.message : null), ((err.errorCode) ? err.errorCode : null));
  responseUtilities.sendJSONResponse(res, responseObject, err.httpStatus);
};