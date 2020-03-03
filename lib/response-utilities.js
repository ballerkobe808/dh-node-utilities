'use strict';

// required modules.
const _ = require('lodash');
const StringUtils = require('./string-utilities');

// variables.
let logger = null;

/**
 * Constructor for a response object.
 * @param [status] - The status message.
 * @param [message] - The message.
 * @param [data] - The data.
 * @param [error] - The error object.
 * @param [errorCode] - An error code.
 * @param [runConvertFunction] - Flag indicating if we should run the convertForJSONResponse function on the data object or not. defaults to false.
 * This requires that the data object have a function called convertForJSONResponse on it or be a top level property object with the function on it on the data object.
 * @constructor
 */
let ResponseObject = function (status, data, message, error, errorCode, runConvertFunction) {
  // add status to the response object if its not empty.
  if (!_.isUndefined(status) && !_.isNull(status) && !_.isEmpty(status)) {
    this.status = status;
  }

  // add message to the response object if its not empty.
  if (!_.isUndefined(message) && !_.isNull(message) && !_.isEmpty(message)) {
    this.message = message;
  }

  // add error to the response object if its not empty.
  if (!_.isUndefined(error) && !_.isNull(error) && !_.isEmpty(error)) {
    this.error = error;
  }

  // add errorCode to the response object if its not empty.
  if (!_.isUndefined(errorCode) && !_.isNull(errorCode)) {
    this.errorCode = errorCode;
  }

  // add data to the response object if its not empty.
  if (!_.isUndefined(data) && !_.isNull(data)) {
    this.data = data;

    // check if we should run the conversion function.
    if (runConvertFunction) {
      try {
        if (objectHasFunction('convertForJSONResponse', this.data)) {
          this.data.convertForJSONResponse();
        }

        for (let key in this.data) {
          if (this.data.hasOwnProperty(key)) {
            if (objectHasFunction('convertForJSONResponse', this.data[key])) {
              this.data[key].convertForJSONResponse();
            }
          }
        }
      }
      catch (ex) {
        logError(ex.message);
        logError(ex.stack);
      }
    }
  }
};

/**
 * Checks if the object has a function with the given name.
 * @param functionName - The function name to search for.
 * @param obj - The object to search on.
 */
function objectHasFunction(functionName, obj) {
  let result = false;

  // check if its really an object. and its not null or undefined.
  if (obj && _.isObject(obj) && !StringUtils.isEmpty(functionName)) {
    if (typeof obj[functionName] == 'function') {
      result = true;
    }
  }

  return result;
}

/**
 * Logs a message.
 * @param message
 */
function logInfo(message) {
  if (logger) {
    logger.info(message);
  }
  else {
    console.log(message);
  }
}

/**
 * Logs a warning message.
 * @param message
 */
function logWarn(message) {
  if (logger) {
    logger.warn(message);
  }
  else {
    console.warn(message);
  }
}

/**
 * Logs an error message.
 * @param message
 */
function logError(message) {
  if (logger) {
    logger.error(message);
  }
  else {
    console.error(message);
  }
}

/**
 * Predefined response statuses.
 */
exports.status = {
  SUCCESS: 'success',
  FAILED: 'failed'
};

/**
 * Set a custom logger.
 * @param log - The logger object reference.
 */
exports.setLogger = (log) => {
  logger = log;
};

/**
 * Builds a new response object.
 * @param [status] - The status of the response.
 * @param [data] - Any data that needs to be send to the client.
 * @param [message] - A message.
 * @param [error] - An error object if an error occurred.
 * @param [errorCode] - An error code.
 * @param [runConvertFunction] - Flag indicating if we should run the convertForJSONResponse function on the data object or not. defaults to false.
 * This requires that the data object have a function called convertForJSONResponse on it or be a top level property object with the function on it on the data object.
 * @returns {ResponseObject} - A new response object.
 */
exports.buildResponseObject = (status, data, message, error, errorCode, runConvertFunction) => {
  // create a new response object.
  return new ResponseObject(status, data, message, error, errorCode, runConvertFunction);
};

/**
 * Utility method that handles all sending of various content type responses.
 * @param res - The response object.
 * @param responseObject - The response data object that will fill in the response headers and body.
 * @param [contentType] - The response content type header value.
 * @param [statusCode] - The response status code header value.
 */
exports.sendResponse = (res, responseObject, contentType, statusCode) => {
  try {
    // check if the response has not been sent yet.
    if (!this.responseSent(res)) {
      // if status code is null assumes its a 200.
      if (!statusCode) {
        statusCode = 200;
      }

      // if content type is set, add a content type header.
      if (contentType && !_.isEmpty(contentType)) {
        // add the content type header.
        res.setHeader('Content-Type', contentType);
      }

      // sent the json response.
      res.status(statusCode).send(responseObject);
    }
    // response has already been sent. Log the response object.
    else {
      logWarn('==================================================');
      logWarn('Headers were already sent.');
      logWarn(JSON.stringify(responseObject, null, '\t'));
      logWarn('==================================================');
    }
  }
  catch (ex) {
    logError('Failed to send response:');
    logError(ex.message);
  }
};

/**
 * Utility method that handles all sending of JSON responses.
 * @param res - The response object.
 * @param responseObject - The response data object that will fill in the response headers and body.
 * @param [statusCode] - The response status code header value.
 */
exports.sendJSONResponse = (res, responseObject, statusCode) => {
  try {
    // check if the response has not been sent yet.
    if (!this.responseSent(res)) {
      // if status code is null assumes its a 200.
      if (!statusCode) {
        statusCode = 200;
      }

      // sent the json response.
      res.status(statusCode).json(responseObject);
    }
    // response has already been sent. Log the response object.
    else {
      logWarn('==================================================');
      logWarn('Headers were already sent.');
      logWarn(JSON.stringify(responseObject, null, '\t'));
      logWarn('==================================================');
    }
  }
  catch (ex) {
    logError('Failed to send JSON response:');
    logError(ex.message);
  }
};

/**
 * Utility method that handles all sending of file responses.
 * @param res - The response object.
 * @param statusCode - The response status code.
 * @param fileName - The file name.
 * @param data - The file object.
 */
exports.sendFileResponse = (res, statusCode, fileName, data) => {
  try {
    // check if the response has not been sent yet.
    if (!this.responseSent(res)) {
      // set the headers.
      res.set({
        "Content-Disposition": 'attachment; filename="' + fileName + '"',
        "Content-Type"       : data.ContentType
      });

      // send the file to the response.
      res.status(statusCode).send(data.Body);
    }
    // response has already been sent. Log the response object.
    else {
      logWarn('==================================================');
      logWarn('Headers were already sent.');
      logWarn(fileName);
      logWarn('==================================================');
    }
  }
  catch (ex) {
    logError('Failed to send file response:');
    logError(ex.message);
  }
};

/**
 * Returns whether or not the response was already sent.
 * @param res
 * @returns {*}
 */
exports.responseSent = (res) => {
  return res._headerSent;
};
