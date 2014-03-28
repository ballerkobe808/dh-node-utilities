// required modules.
var _ = require('underscore');

/**
 * Constructor for a response object.
 * @param [status] - The status message.
 * @param [message] - The message.
 * @param [data] - The data.
 * @param [error] - The error object is any.
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
}

/**
 * Predefined response statuses.
 */
exports.status = {
    SUCCESS: 'success',
    FAILED: 'failed',

    MESSAGE_TYPE_ERROR: 'message_type_error',
    MESSAGE_TYPE_WARNING: 'message_type_warning'
};

/**
 * Builds a new response object.
 * @param status - The status of the response.
 * @param data - Any data that needs to be send to the client.
 * @param message - A message.
 * @param error - An error object if an error occurred.
 * @returns {ResponseObject} - A new reponse object.
 */
exports.buildResponse = function (status, data, message, error) {
    // create a new response object.
    return new ResponseObject(status, data, message, error);
};