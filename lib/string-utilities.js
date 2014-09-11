// module dependencies.
var _ = require('underscore');

/**
 * Checks if a value is undefined, null or empty.
 * @param value - the value to check.
 * @returns {*} - if it is empty it returns true, else returns false.
 */
exports.isEmpty = function (value) {
  return (_.isUndefined(value) || _.isNull(value) || _.isEmpty(value));
};

/**
 * Checks if a string contains another string.
 * @param string - The main string to search through.
 * @param match - the search text.
 * @param caseSensitive - If the match should be case sensitive.
 * @returns {boolean} - If the search text is present in the main string.
 */
exports.contains = function(string, match, caseSensitive) {
  if (string && match) {
    // check case sensitive flag.
    if (caseSensitive) {
      return (string.trim().indexOf(match) != -1);
    }
    else {
      return (string.trim().toLowerCase().indexOf(match.toLowerCase()) != -1);
    }
  }
  else {
    return false;
  }
};

/**
 * Gets the string value for the specified value.
 * If its an object, it will return and empty string.
 * @param value - The value variable.
 * @returns {string} - The string version of the variables value.
 */
exports.stringValue = function(value) {
  // set the default result to empty string initially.
  var stringValue = '';

  // check if the value is a boolean, string, or number.
  if (!_.isObject(value) && !_.isArray(value)) {
    stringValue = value.toString();
  }

  // return the value.
  return stringValue;
};

/**
 * Checks that all variables in the parameters array are not undefined, null or empty.
 * @param parameters - An array of parameters to check that a value is set.
 * @returns {boolean} - If all parameters pass.
 */
exports.validateParameters = function (parameters) {
  for (var i = 0; i < parameters.length; i++) {
    var parameter = parameters[i];
    if (_.isUndefined(parameter) || _.isNull(parameter) || _.isEmpty(parameter)) {
      return true;
    }
  }

  return true;
};

/**
 * Converts a string (true/false) value to a boolean value.
 * @param value
 * @returns {boolean}
 */
exports.getBooleanValue = function(value) {
  var result = false;

  if (!_.isUndefined(value) && !_.isNull(value) && !_.isEmpty(value)) {
    if (value.toLowerCase() == 'true') {
      result = true;
    }
  }

  return result;
};

/**
 * Generates a GUID.
 * @returns {string}
 */
exports.newGuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

/**
 * Returns an object as a nice string formatted JSON string.
 * @param obj - The object to print.
 * @returns {*}
 */
exports.prettifyJSONObject = function (obj) {
  var result = '';

  if (!_.isUndefined(obj) && !_.isNull(obj) && !_.isEmpty(obj)) {
    result = JSON.stringify(obj, null, '\t');
  }

  return result;
};

/**
 * Replaces all occurrances of a string.
 * @param stringValue - the full string value to perform the replace all on.
 * @param valueToRepalce - The value that is being replaced.
 * @param replaceWith - The value to replace with.
 */
exports.replaceAll = function (stringValue, valueToRepalce, replaceWith) {
  return stringValue.replace(new RegExp(escapeMetaCharacters(valueToRepalce), 'g'), replaceWith);
};

/**
 * Escapes special characters to be used in a regex statement.
 * @param string
 * @returns {XML|string|void}
 */
function escapeMetaCharacters(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}