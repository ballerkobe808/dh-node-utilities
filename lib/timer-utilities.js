'use strict';

// dependencies.
const stringUtils = require('./string-utilities');

/**
 * Used to nicely print the time difference between 2 times(milliseconds).
 * @param start - Start time in milliseconds.
 * @param end - End time in milliseconds. Defaulted to Date.now() if not set.
 */
exports.getTimeDifferenceString = function (start, end) {
  // make sure start is set.
  if (stringUtils.isEmpty(start)) {
    return null;
  }

  // set the end time to now if its not already set.
  if (stringUtils.isEmpty(end)) {
    end = Date.now();
  }

  // get the time difference.
  let difference = end - start;

  // get the times.
  let hours = Math.floor(difference / (1000 * 60 * 60) % 60);
  let minutes = Math.floor(difference / (1000 * 60) % 60);
  let seconds = Math.floor(difference / 1000 % 60);
  let milliseconds = Math.floor(difference % 1000);

  // stores the strings of times to concatenate.
  let results = [];

  // check what is the highest measure of time that is greater than 0.
  if (hours > 0) {
    results.push(`${hours} Hour(s)`);
    results.push(`${minutes} Minute(s)`);
    results.push(`${seconds} Second(s)`);
  }
  else if (minutes > 0) {
    results.push(`${minutes} Minute(s)`);
    results.push(`${seconds} Second(s)`);
  }
  else if (seconds > 0) {
    results.push(`${seconds} Second(s)`);
  }
  else {
    results.push(`${milliseconds} Millisecond(s)`);
  }

  // combine the results.
  return results.join(' ');
};

/**
 * Converts a time in miliseconds to a nice formatted string.
 * @param time - time in miliseconds.
 */
exports.formatTime = function (time) {
  // make sure start is set.
  if (stringUtils.isEmpty(time)) {
    return null;
  }

  // get the times.
  let milliseconds = parseInt((time%1000));
  let seconds = parseInt((time/1000)%60);
  let minutes = parseInt((time/(1000*60))%60);
  let hours = parseInt((time/(1000*60*60))%24);

  // stores the strings of times to concatenate.
  let results = [];

  // check what is the highest measure of time that is greater than 0.
  if (hours > 0) {
    results.push(`${hours} Hour(s)`);
    results.push(`${minutes} Minute(s)`);
    results.push(`${seconds} Second(s)`);
  }
  else if (minutes > 0) {
    results.push(`${minutes} Minute(s)`);
    results.push(`${seconds} Second(s)`);
  }
  else if (seconds > 0) {
    results.push(`${seconds} Second(s)`);
  }
  else {
    results.push(`${milliseconds} Millisecond(s)`);
  }

  // combine the results.
  return results.join(' ');
};