'use strict';

// dependencies.
var fs = require('fs');

/**
 * Checks if a file exists at the specified path.
 * @param filePath - The file path to the file to check.
 * @returns {*} - Boolean value whether it exists or not.
 */
exports.fileExists = function(filePath) {
  try
  {
    return fs.statSync(filePath).isFile();
  }
  catch (err)
  {
    return false;
  }
};