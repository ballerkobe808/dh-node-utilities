// ----------------------------------------------------------------------
// This is the general use logging utility
//
// Bootstrap it to your server logs. Here is an example:
//
// NOTE: THis line has to be the first in your server.js before any other call to create/get a logger object is made//
// var logger = require('./app/utilities/log-utilities')('../rcuh-logs/','rcuh-web-log');
//
// // express-winston logger makes sense BEFORE the router.
// logger.addGeneralLogger(app);
//
// app.use(app.router);
//
// // express-winston errorLogger makes sense AFTER the router.
// logger.addErrorLogger(app);
//
//
//
// Also you can use require in other places once the logger has been instantiated.
//
// var logger = require('./app/utilities/log-utilities')();
// logger.info('texthere');
// logger.warn('texthere');
// -----------------------------------------------------------------------


/**
 * Module dependencies
 */
var winston = require('winston');
var expressWinston = require('express-winston');
var util = require('util');
var fs = require('fs');

//
// Requiring `winston-loggly` will expose
// `winston.transports.Loggly`
//
require('winston-loggly');

var currentLogger;


/**
 * Constructor to create a new logger object
 *
 * @param logpath
 * @param logFilename
 * @param logglyTag - the tag to send to loggly (this is how we filter logs in loggly - should be the env ur in)
 * @constructor
 */
var DHLogger = function (logpath, logFilename, logglyTag) {
    // check if the last character is a /, if not add it

    // create the logs directory if it doesnt already exist.
    if (!fs.existsSync(logpath)) {
        fs.mkdirSync(logpath);
    }

    // use the current date in the file name so the logs dont get too big and can be archived
    this.filename = logpath + logFilename + '-' + getDateAsString() + '.log';
    this.environmentTag = logglyTag;

    // general logger that can be used throughout the app
    this.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({ filename: this.filename, timestamp: function(){return getCurrentTime();}}),
            new (winston.transports.Loggly)({ subdomain: 'dhrcuh', inputToken: 'e298bdee-6043-401c-8afe-331683eab550', tags: [this.environmentTag]})

        ]
    });
};



/**
 * Bootstrap this module to the server app
 *
 * @param app (usually express app)
 */
DHLogger.prototype.addGeneralLogger = function(app){
    // make sure there is a filename
    if (this.filename === '') {
        util.debug('File Path and Name has not been loaded.');
    }

    app.use(expressWinston.logger({
        transports: [
            new (winston.transports.File)({ filename: this.filename, timestamp: function(){return getCurrentTime();}}),
            new (winston.transports.Loggly)({ subdomain: 'dhrcuh', inputToken: 'e298bdee-6043-401c-8afe-331683eab550', tags: [this.environmentTag]})
        ]
    }));
};


/**
 * Bootstrap the Error logger to the server app
 *
 * @param app (usually express app)
 */
DHLogger.prototype.addErrorLogger = function(app){
    // make sure there is a filename
    if (this.filename === '') {
        util.debug('File Path and Name has not been loaded.');
    }

    // express-winston errorLogger makes sense AFTER the router.
    app.use(expressWinston.errorLogger({
        transports: [
            new (winston.transports.File)({ filename: this.filename, timestamp: function(){return getCurrentTime();}}),
            new (winston.transports.Loggly)({ subdomain: 'dhrcuh', inputToken: 'e298bdee-6043-401c-8afe-331683eab550', tags: [this.environmentTag]})
        ]
    }));


};


// ----------------------------------------------------------------------
// wrap the winston logger functions to use in the app
//
//
// -----------------------------------------------------------------------
DHLogger.prototype.info = function (message) {
    this.logger.info(message);
};

DHLogger.prototype.warn = function (message) {
    this.logger.warn(message);
};

DHLogger.prototype.error = function (message) {
    this.logger.error(message);
};


/**
 * The module object is instantiated using the log path and filename supplied
 *
 * @param logpath
 * @param logFilename
 * @returns either a new object, or the existing one, if it exists
 */
module.exports = function(logpath, logFilename, logglyTag) {
    // make this module a singleton - once instantiated, doesnt need to be re-instantiated
    if (!currentLogger) {
       currentLogger = new DHLogger(logpath, logFilename, logglyTag);
    }

    return currentLogger;
};




// ----------------------------------------------------------------------
// helper functions to get current date/time
//
//
// -----------------------------------------------------------------------


/**
 * @returns the current date/time
 */
function getCurrentTime(){
    var date = new Date();
    return date.toLocaleString();
}

/**
 * get the current date represented as a string
 *
 * @returns {string}
 */
function getDateAsString() {
    var date = new Date();

    var month = (date.getMonth() + 1);
    if (month < 10) {
        month = '0' + month;
    }

    var day = date.getDate();
    if (day < 10) {
        day = '0' + day;
    }

    var year = date.getFullYear();

    return year + '-' + month + '-' + day;
}






