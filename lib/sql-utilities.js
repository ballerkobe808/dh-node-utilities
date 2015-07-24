'use strict';

// dependencies
var _ = require('underscore');
var validator = require('validator');
var async = require('async');
var stringUtilities = require('./string-utilities');

/**
 * Builds the list of select fields using an array of mappings.
 * @param mappings - The array of mapping objects.
 * @returns {string}
 *
 * {
 *  field: String,
 *  rename: String
 * }
 */
exports.createSelectFields = function(tableName, mappings) {
  var selectClause = '';

  for (var i = 0; i < mappings.length; i++) {
    if (i != 0) {
      selectClause += ', ';
    }

    selectClause += ((tableName) ? tableName + '.' : '') + mappings[i].field;

    if (mappings[i].rename && !_.isEmpty(mappings[i].rename)) {
      selectClause += ' AS ' + mappings[i].rename;
    }
  }

  return selectClause;
};

/**
 * Builds an insert object (object with sql and params array).
 * @param tableName - The name of the table to insert into.
 * @param parameters - An object of key value pairs.
 */
exports.generateInsertObject = function (tableName, parameters) {
  var sql = 'INSERT INTO ' + tableName;

  // build the parameter lists.
  var columnNamesString = '';
  var valuePlaceHolders = '';
  var paramsArray = [];

  // keep track of the current index.
  var index = 0;

  // loop over all the keys.
  for (var key in parameters) {
    if (parameters.hasOwnProperty(key) && parameters[key] != undefined) {
      // if its not the last parameter, add a comma.
      if (index != 0) {
        columnNamesString += ', ';
        valuePlaceHolders += ', ';
      }

      // increment the index.
      index++;

      columnNamesString += key;
      valuePlaceHolders += '?';
      paramsArray.push(parameters[key]);
    }
  }

  // connect it to the initial statement.
  sql += ' (' + columnNamesString + ') VALUES (' + valuePlaceHolders + ')';

  // build the insert object.
  return {
    sql: sql,
    params: paramsArray
  };
};

/**
 * Builds an update object (object with sql and params array).
 * @param tableName - The name of the table.
 * @param parameters - The object of key value pairs where keys are the db column names.
 * @param conditions - The sql condition statement.
 * @param conditionParams - The array of parameters that match the conditions place markers.
 */
exports.generateUpdateObject = function (tableName, parameters, conditions, conditionParams) {
  var sql = 'UPDATE ' + tableName + ' SET ';
  var paramsArray = [];

  var index = 0;

  for (var key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      if (index != 0) {
        sql += ', ';
      }

      // increment the index.
      index++;

      // add the key to they statement.
      sql += key + ' = ? ';
      paramsArray.push(parameters[key]);
    }
  }

  // add the conditions part of the statement.
  sql += 'WHERE ' + conditions;

  // add the condition parameters part.
  for (var i = 0; i < conditionParams.length; i++) {
    paramsArray.push(conditionParams[i]);
  }

  return {
    sql: sql,
    params: paramsArray
  };
};

/**
 * Converts a value to a boolean value.
 * @param value - the value to convert.
 */
exports.booleanValue = function(value) {
  var result = false;
  try {
    if (Buffer.isBuffer(value)) {
      result = validator.toBoolean(value[0]);
    }
    else {
      result = validator.toBoolean(value);
    }
  }
  catch (ex) {
    console.log('Failed to parse database boolean value.');
    console.log(ex);
  }

  return result;
};

/**
 * Groups related db rows into objects.
 * @param groupByField - The field that relates rows together.
 * @param rows - The list of all rows to iterate over.
 * @param callback - The finished callback function.
 */
exports.groupRows = function (groupByField, rows, callback) {
  // stores the rows as separate objects.
  // {
  //   <groupByFied>: 1,
  //   rows: []
  // }
  var rawRowList = [];

  try {
    // iterate over all the rows and split them into their group objects.
    async.each(rows,
      // item processor.
      function (row, cb) {
        // get the user id field.
        var groupByFieldValue = row[groupByField];

        var props = {};
        props[groupByField] = groupByFieldValue;
        var foundObject = _.findWhere(rawRowList, props);

        if (!foundObject) {
          foundObject = {};
          foundObject[groupByField] = groupByFieldValue;
          foundObject.rows = [];
          foundObject.rows.push(row);
          rawRowList.push(foundObject);
        }
        else {
          foundObject.rows.push(row);
        }

        return cb();
      },

      // finished callback handler.
      function (err) {
        return callback(err, rawRowList);
      }
    );
  }
  catch (err) {
    console.log(err);
    return callback(err);
  }
};

/**
 * Converts a placeholder filled sql string with the params array for debug printing.
 * @param sql - The sql statement containing placehoders.
 * @param params - The array of parameters.
 * @returns {string}
 */
exports.queryToString = function (sql, params, timezone) {
  var final = '';
  var paramsIndex = 0;

  for (var i = 0; i < sql.length; i++) {
    if (sql.charAt(i) == '?') {
      if (typeof params[paramsIndex] == 'string') {
        if (params[paramsIndex].lastIndexOf('[@]', 0) === 0) {
          final += stringUtilities.replaceAll(params[paramsIndex], '[@]', '@');
        }
        else {
          final += "'" + stringUtilities.replaceAll(params[paramsIndex], "'", "\\'") + "'";
        }
      }
      else if (Object.prototype.toString.call(params[paramsIndex]) === '[object Date]') {
        final += "'" + dateToString(params[paramsIndex], timezone) + "'";
      }
      else {
        final += params[paramsIndex];
      }

      paramsIndex++;
    }
    else {
      final += sql.charAt(i);
    }
  }

  return final;
}

function dateToString(date, timeZone) {
  var dt = new Date(date);

  if (timeZone && timeZone != 'local') {
    var tz = convertTimezone(timeZone);

    dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
    if (tz !== false) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }
  }

  var year   = dt.getFullYear();
  var month  = zeroPad(dt.getMonth() + 1, 2);
  var day    = zeroPad(dt.getDate(), 2);
  var hour   = zeroPad(dt.getHours(), 2);
  var minute = zeroPad(dt.getMinutes(), 2);
  var second = zeroPad(dt.getSeconds(), 2);
  var millisecond = zeroPad(dt.getMilliseconds(), 3);

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
};

function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = '0' + number;
  }

  return number;
}

function convertTimezone(tz) {
  if (tz == "Z") return 0;

  var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (m[1] == '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
  }
  return false;
}