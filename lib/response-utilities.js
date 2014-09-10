// required modules.
var _ = require('underscore');
var util = require('util');

/**
 * Predefined response statuses.
 */
exports.status = {
  SUCCESS: 'success',
  FAILED: 'failed'
};

/**
 * Constructor for a response object.
 * @param [status] - The status message.
 * @param [message] - The message.
 * @param [data] - The data.
 * @param [error] - The error object.
 * @constructor
 */
var ResponseObject = function (status, data, message, error) {
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

  // add data to the response object if its not empty.
  if (!_.isUndefined(data) && !_.isNull(data)) {
    this.data = data;
  }
};

/**
 * Builds a new response object.
 * @param [status] - The status of the response.
 * @param [data] - Any data that needs to be send to the client.
 * @param [message] - A message.
 * @param [error] - An error object if an error occurred.
 * @returns {ResponseObject} - A new response object.
 */
exports.buildResponseObject = function (status, data, message, error) {
  // create a new response object.
  return new ResponseObject(status, data, message, error);
};

/**
 * Utility method that handles all sending of various content type responses.
 * @param res - The response object.
 * @param responseObject - The response data object that will fill in the response headers and body.
 * @param [contentType] - The response content type header value.
 * @param [statusCode] - The response status code header value.
 */
exports.sendResponse = function(res, responseObject, contentType, statusCode) {
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
    res.send(statusCode, responseObject);
  }
  // response has already been sent. Log the response object.
  else {
    util.log('==================================================');
    util.log('Headers were already sent.');
    util.log(JSON.stringify(responseObject, null, '\t'));
    util.log('==================================================');
  }
};

/**
 * Utility method that handles all sending of JSON responses.
 * @param res - The response object.
 * @param responseObject - The response data object that will fill in the response headers and body.
 * @param [statusCode] - The response status code header value.
 */
exports.sendJSONResponse = function(res, responseObject, statusCode) {
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
    util.log('==================================================');
    util.log('Headers were already sent.');
    util.log(JSON.stringify(responseObject, null, '\t'));
    util.log('==================================================');
  }
};

/**
 * Utility method that handles all sending of file responses.
 * @param res - The response object.
 * @param statusCode - The response status code.
 * @param fileName - The file name.
 * @param data - The file object.
 */
exports.sendFileResponse = function(res, statusCode, fileName, data) {
// check if the response has not been sent yet.
  if (!this.responseSent(res)) {
    // set the headers.
    res.set({
      "Content-Disposition": 'attachment; filename="'+ fileName +'"',
      "Content-Type": data.ContentType
    });

    // send the file to the response.
    res.send(statusCode, data.Body);
  }
  // response has already been sent. Log the response object.
  else {
    util.log('==================================================');
    util.log('Headers were already sent.');
    util.log(fileName);
    util.log('==================================================');
  }
};

/**
 * Returns whether or not the response was already sent.
 * @param res
 * @returns {*}
 */
exports.responseSent = function (res) {
  return res._headerSent;
};