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