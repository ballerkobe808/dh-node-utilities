// dependencies
var logger = require('./log-utilities')();
var responseUtilities = require('./response-utilities');

/**
 * Builds an error object with the specified information.
 * @param errorType
 * @param messageType
 * @param message
 * @param httpStatus
 * @param statusCode
 * @returns {Error}
 */
exports.createError = function(errorType, messageType, message, httpStatus, statusCode, err) {
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
 * AS400 generic error object.
 * @param [message]
 * @param [err]
 * @returns {Error}
 * @constructor
 */
exports.AS400Error = function(message, err) {
    return exports.createError('AS400Error', responseUtilities.status.MESSAGE_TYPE_ERROR, 'AS400 Database Error' + (message ? ': ' + message : ''), 503, responseUtilities.status.FAILED, err);
};

/**
 * Error handler route.
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

  if (err.messageType == responseUtilities.status.MESSAGE_TYPE_WARNING) {
    logger.warn(err.message, {error: err.err});
  }
  else if (err.messageType == responseUtilities.status.MESSAGE_TYPE_ERROR) {
    logger.error(err.message, {error: err.err});
  }

  if (err.err) {
    res.status(err.httpStatus).json(responseUtilities.buildResponse(err.statusCode, null, err.message, err.err.message));
  }
  else {
    res.status(err.httpStatus).json(responseUtilities.buildResponse(err.statusCode, null, err.message, null));
  }
};