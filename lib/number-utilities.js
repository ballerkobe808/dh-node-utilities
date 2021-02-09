'use strict';

// dependencies
const validator = require('validator');

/**
 * Increments an alpha numeric number.
 * @param number - the number to increment.
 * @returns {string} - the result.
 */
exports.incrementAlphaNumericString = (number) => {
  // split the characters of the number into an array so we can increment individual characters.
  let characters = number.split('');

  // save the index of the number we are currently incrementing.
  let currentIndex = characters.length - 1;

  // get the increment result.
  let result = incrementCharacter(characters[currentIndex]);

  // get the new value for the current index.
  characters[currentIndex] = result.newValue;

  // move the index back 1 number in case we need to handle an overflow.
  currentIndex--;

  // if an overflow occurred, increment the next number up the line.
  while (result.overflow) {
    // check that we didn't pass the beginning of the string yet.
    if (currentIndex >= 0) {
      // save the new result.
      result = incrementCharacter(characters[currentIndex]);

      // set the current index number to the new incremented value.
      characters[currentIndex] = result.newValue;

      // move the pointer.
      currentIndex--;
    }
    // we passed the beginning of the string. add another digit.
    else {
      // add 1 to the beginning of the string to increment the number.
      characters.unshift('1');

      // break out of the loop since we finished incrementing the whole string.
      break;
    }
  }

  // return the result as a string again.
  return characters.join('');
};

/**
 * Increments a single character by 1.
 * @param char - The character.
 * @return {*} - Object containing an overflow flag and the new single character value.
 */
function incrementCharacter (char) {
  // build the result object.
  let result = {
    // indicates if the increment forced an overflow to a new digit.
    overflow: false,

    // the new value defaulted to the current value.
    newValue: char
  };

  // check if the value is a number.
  if (validator.isNumeric(char)) {
    let num = parseInt(char);

    // if the number is 9 switch to letters.
    if (num === 9) {
      result.newValue = 'A';
    }
    else {
      result.newValue = (num + 1).toString();
    }
  }
  // its a character.
  else {
    if (char === 'Z') {
      result.overflow = true;
      result.newValue = '0';
    }
    else {
      result.newValue = String.fromCharCode(char.charCodeAt(0) + 1)
    }
  }

  return result;
}
