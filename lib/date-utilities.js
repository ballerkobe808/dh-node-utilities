'use strict';


/**
 * Converts a date to a utc date.
 * @param date
 * @returns {Date}
 */
exports.convertDateToUTC = function(date) {
  if (!date || isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
};