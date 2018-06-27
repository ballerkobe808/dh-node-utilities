'use strict';

// module dependencies.
const _ = require('underscore');

/**
 * Checks if a value is undefined, null or empty.
 * @param value - the value to check.
 * @param [ignoreWhiteSpace] - Ignores white space when checking.
 * @returns {*} - if it is empty it returns true, else returns false.
 */
exports.isEmpty = function (value, ignoreWhiteSpace) {
  let stringValue = '';

  if (!_.isUndefined(value) && !_.isNull(value)) {
    stringValue = value.toString();
    if (ignoreWhiteSpace) {
      stringValue = stringValue.trim();
    }
  }

  return (_.isEmpty(stringValue));
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
  let stringValue = '';

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
  for (let i = 0; i < parameters.length; i++) {
    let parameter = parameters[i];
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
  let result = false;

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
    let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

/**
 * Returns an object as a nice string formatted JSON string.
 * @param obj - The object to print.
 * @returns {*}
 */
exports.prettifyJSONObject = function (obj) {
  let result = '';

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
 * Comma separates a dollar amount.
 * @param val
 * @returns {*}
 */
exports.commaSeparatedNumber = function (val) {
  val = val.toString();
  while (/(\d+)(\d{3})/.test(val.toString())) {
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }

  return val;
}

/**
 * Comma separates a dollar amount.
 * @param val
 * @returns {*}
 */
exports.commaSeparatedCurrency = function (val) {
  val = val.toString();
  let result = '$';
  while (/(\d+)(\d{3})/.test(val.toString())) {
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }

  result += val;

  // add decimal place if its missing the decimal place.
  if (!this.contains(val, '.')) {
    result += '.00';
  }
  else {
    let decimalIndex = val.lastIndexOf('.') + 1;
    if ((val.length - decimalIndex) != 2) {
      result += '0';
    }
  }

  return result;
}

/**
 * Checks if a string is present at the specified position in the staring.
 * @param value - The String value to search.
 * @param searchString - The search string.
 * @param position - The position to start from. Defaults to 0.
 * @returns {boolean}
 */
exports.existsAtPosition = function(value, searchString, position) {
  // if value isn't set return false.
  if (exports.isEmpty(value)) {
    return false;
  }

  // set the position.
  position = position || 0;
  return value.indexOf(searchString, position) === position;
};

/**
 * Escapes special characters to be used in a regex statement.
 * @param string
 * @returns {XML|string|void}
 */
function escapeMetaCharacters(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * Checks how many time a string is present in the specified value.
 * @param value - The full value to check.
 * @param match - The string to look for in the value.
 */
exports.countOfCharacter = function(value, match) {
  try {
    let count = 0;

    if (exports.isEmpty(value) || exports.isEmpty(match)) {
      return count;
    }

    count = value.split(match).length - 1;

    if (count == -1) {
      count = 0;
    }

    return count;
  }
  catch (ex) {
    console.log(ex.message);
    return 0;
  }
};