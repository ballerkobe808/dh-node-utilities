'use strict';

//======================================================================================
// Dependencies.
//======================================================================================

const moment = require('moment');
const winston = require('winston');
const StringUtils = require('./string-utilities');

//======================================================================================
// Properties.
//======================================================================================

// reference for logger.
let logger = null;

// flag indicating if we should display the caller full file path.
let displayFullPath = false;

//======================================================================================
// Initialize.
//======================================================================================

/**
 * Initialize the logger. MUST CALL THIS ONCE.
 * @param config - The config object. EX:
 * {
 *   disableConsole: boolean,
 *   papertrail: {
 *     host: string,
 *     port: string
 *   },
 *   transports: [ Array of winston transports ]
 * }
 */
exports.initialize = function (config) {
  // skip setting the logger.
  if (!config) {
    console.error('Config object missing. Cannot configure the logger.');
    return;
  }

  // build the logger config.
  let options = {
    transports: []
  };

  // add the console transport if the disable flag is not set.
  if (!config.disableConsole) {
    options.transports.push(new (winston.transports.Console)({
      prettyPrint: true,
      colorize   : true,
      silent     : false,
      timestamp  : function () {
        return getConsoleTimestamp();
      }
    }));
  }

  // if the papertrail object is set. add the transport.
  if (config.papertrail) {
    // add papertrail as a transport option.
    require('winston-papertrail').Papertrail;

    // add the papertrail config.
    options.transports.push(new winston.transports.Papertrail({
      host: config.papertrail.host,
      port: config.papertrail.port,
      logFormat: (config.papertrail.format) ? config.papertrail.format : function (level, message) {
        return level.toUpperCase() + ': ' + message;
      },
      colorize: StringUtils.isEmpty(config.papertrail.colorize) ? false : config.papertrail.colorize
    }));
  }

  // if there are more transports, just add them.
  if (config.transports && config.transports.length > 0) {
    for (let i = 0; i < config.transports.length; i++) {
      options.transports.push(config.transports[i]);
    }
  }

  // set display full path if the param is set.
  if (!StringUtils.isEmpty(config.displayFullPath)) {
    displayFullPath = config.displayFullPath;
  }

  // create the logger.
  logger = new (winston.Logger)(options);
};

//======================================================================================
// Logging functions.
//======================================================================================

exports.debug = function (message) {
  // make sure logger was initialized.
  if (!logger) {
    console.log(message);
    return;
  }

  // get the calling file name and line number.
  let callerFile = getCallerFile();

  // if the caller file is set.
  if (callerFile) {
    logger.debug('[' + callerFile.file + '][' + callerFile.lineNumber + ']: ' + message);
  }
  else {
    logger.debug(message);
  }
};

exports.write = function (message) {
  // make sure logger was initialized.
  if (!logger) {
    console.log(message);
    return;
  }

  // get the calling file name and line number.
  let callerFile = getCallerFile();

  // if the caller file is set.
  if (callerFile) {
    logger.info('[' + callerFile.file + '][' + callerFile.lineNumber + ']: ' + message);
  }
  else {
    logger.info(message);
  }
};

exports.log = function (message) {
  // make sure logger was initialized.
  if (!logger) {
    console.log(message);
    return;
  }

  // get the calling file name and line number.
  let callerFile = getCallerFile();

  // if the caller file is set.
  if (callerFile) {
    logger.info('[' + callerFile.file + '][' + callerFile.lineNumber + ']: ' + message);
  }
  else {
    logger.info(message);
  }
};

exports.info = function (message) {
  // make sure logger was initialized.
  if (!logger) {
    console.log(message);
    return;
  }

  // get the calling file name and line number.
  let callerFile = getCallerFile();

  // if the caller file is set.
  if (callerFile) {
    logger.info('[' + callerFile.file + '][' + callerFile.lineNumber + ']: ' + message);
  }
  else {
    logger.info(message);
  }
};

exports.warn = function (message) {
  // make sure logger was initialized.
  if (!logger) {
    console.log(message);
    return;
  }

  // get the calling file name and line number.
  let callerFile = getCallerFile();

  // if the caller file is set.
  if (callerFile) {
    logger.warn('[' + callerFile.file + '][' + callerFile.lineNumber + ']: ' + message);
  }
  else {
    logger.warn(message);
  }
};

exports.error = function (message) {
  // make sure logger was initialized.
  if (!logger) {
    console.error(message);
    return;
  }

  // get the calling file name and line number.
  let callerFile = getCallerFile();

  // if the caller file is set.
  if (callerFile) {
    logger.error('[' + callerFile.file + '][' + callerFile.lineNumber + ']: ' + message);
  }
  else {
    logger.error(message);
  }
};

//======================================================================================
// Clean up functions.
//======================================================================================

/**
 * Closes all the winston transports.
 */
exports.closeTransports = function () {
  logger.close();
};

//======================================================================================
// Helper functions.
//======================================================================================

/**
 * Gets the current timestamp string.
 * @return {string}
 */
function getConsoleTimestamp() {
  return moment().format('YYYY-MM-DD hh:mm:ss a');
}

/**
 * Gets the file name of where a log call was made.
 * @returns {*}
 */
function getCallerFile() {
  try {
    let err = new Error();
    let currentFile;

    Error.prepareStackTrace = function (err, stack) { return stack; };

    currentFile = err.stack.shift().getFileName();

    while (err.stack.length) {
      let item = err.stack.shift();
      let lineNumber = item.getLineNumber();
      let callerFile = item.getFileName();

      if (currentFile !== callerFile) {
        return {
          file: (displayFullPath) ? callerFile : callerFile.replace(/^.*[\\\/]/, ''),
          lineNumber: lineNumber
        };
      }
    }
  }
  catch (ex) {
    console.error(ex.message);
  }
}