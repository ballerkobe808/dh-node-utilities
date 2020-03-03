'use strict';

/**
 * Converts a date to a utc date.
 * @param date - A date object.
 * @returns {Date} - The UTC date object.
 */
exports.convertDateToUTC = function(date) {
  // if the date object is not set.
  if (!date || isNaN(date.getTime())) {
    return null;
  }

  // returns the date converted to UTC date.
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
};

/**
 * Checks if the first date precedes the second date. This ignores time. Only compares the date part of the object.
 * @param date1 - The first date object to check.
 * @param date2 - The second date object to check.
 * @param inclusive - If the comparison is inclusive or not.
 * @returns {*}
 */
exports.firstDatePrecedesSecond = function (date1, date2, inclusive) {
  try {
    let date1DateOnly = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    let date2DateOnly = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

    if (inclusive) {
      return (date1DateOnly.getTime() <= date2DateOnly.getTime());
    }
    else {
      return (date1DateOnly.getTime() < date2DateOnly.getTime());
    }
  }
  catch(ex) {
    console.log(ex);
    return null;
  }
};
