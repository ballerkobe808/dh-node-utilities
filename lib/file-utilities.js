'use strict';

// dependencies.
const fs = require('fs');

/**
 * Checks if a file exists at the specified path.
 * @param filePath - The file path to the file to check.
 * @returns {*} - Boolean value whether it exists or not.
 */
exports.fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  }
  catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Checks if a directory exists at the specified path.
 * @param directoryPath - The directory path to the directory to check.
 * @returns {*} - Boolean value whether it exists or not.
 */
exports.directoryExists = (directoryPath) => {
  try {
    return fs.statSync(directoryPath).isDirectory();
  }
  catch (err) {
    console.error(err);
    return false;
  }
};
