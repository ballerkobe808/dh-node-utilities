'use strict';

// dependencies.
var statusCodes = require('./constants/status-codes');
var responseUtilities = require('./response-utilities');
var stringUtilities = require('./string-utilities');
var util = require('util');

/**
 * Builds an error object with the specified information.
 * @param errorType
 * @param messageType
 * @param message
 * @param httpStatus
 * @param statusCode
 * @param [err] - An error object is one was passed.
 * @returns {Error}
 */
function CustomError(errorType, messageType, message, httpStatus, statusCode, err) {
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

  return error;
}

/**
 * Creates a new custom error object.
 */
exports.createError = function (errorType, messageType, message, httpStatus, statusCode, err) {
  return new CustomError(errorType, messageType, message, httpStatus, statusCode, err);
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

  if (err.messageType == statusCodes.MESSAGE_TYPE_WARN) {
    util.log(err.message);
    util.log(stringUtilities.prettifyJSONObject(err.err));
  }
  else if (err.messageType == statusCodes.MESSAGE_TYPE_ERROR) {
    util.error(err.message);
    util.error(stringUtilities.prettifyJSONObject(err.err));
  }

  if (err.err) {
    var responseObject = responseUtilities.buildResponseObject(err.statusCode, null, err.message, err.err.message);
    responseUtilities.sendJSONResponse(res, responseObject, err.httpStatus);
  }
  else {
    var responseObject = responseUtilities.buildResponseObject(err.statusCode, null, err.message, null);
    responseUtilities.sendJSONResponse(res, responseObject, err.httpStatus);
  }
};