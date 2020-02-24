'use strict';

// dependencies
const _ = require('lodash');
const validator = require('validator');
const async = require('async');
const StringUtils = require('./string-utilities');

/**
 * Builds the list of select fields using an array of mappings.
 * @param tableName - The table name.
 * @param mappings - The array of mapping objects.
 * @returns {string}
 *
 * {
 *  field: String,
 *  rename: String
 * }
 */
exports.createSelectFields = (tableName, mappings) => {
  let selectClause = '';

  for (let i = 0; i < mappings.length; i++) {
    if (i !== 0) {
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
exports.generateInsertObject = (tableName, parameters) => {
  let sql = `INSERT INTO ${tableName}`;

  // build the parameter lists.
  let columnNamesString = '';
  let valuePlaceHolders = '';
  let paramsArray = [];

  // keep track of the current index.
  let index = 0;

  // loop over all the keys.
  for (let key in parameters) {
    if (parameters.hasOwnProperty(key) && !_.isUndefined(parameters[key])) {
      // if its not the last parameter, add a comma.
      if (index !== 0) {
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
  sql += ` (${columnNamesString}) VALUES (${valuePlaceHolders})`;

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
exports.generateUpdateObject = (tableName, parameters, conditions, conditionParams) => {
  let sql = `UPDATE ${tableName} SET `;
  let paramsArray = [];

  let index = 0;

  for (let key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      if (index !== 0) {
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
  for (let i = 0; i < conditionParams.length; i++) {
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
exports.booleanValue = (value) => {
  let result = false;
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
exports.groupRows = (groupByField, rows, callback) => {
  // stores the rows as separate objects.
  // {
  //   <groupByField>: 1,
  //   rows: []
  // }
  let rawRowList = [];

  try {
    // iterate over all the rows and split them into their group objects.
    async.each(rows,
      // item processor.
      (row, cb) => {
        // get the user id field.
        let groupByFieldValue = row[groupByField];

        let props = {};
        props[groupByField] = groupByFieldValue;
        let foundObject = _.find(rawRowList, props);

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
      (err) => {
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
 * @param sql - The sql statement containing placeholders.
 * @param params - The array of parameters.
 * @param timezone - The timezone.
 * @returns {string}
 */
exports.queryToString = (sql, params, timezone) => {
  let final = '';
  let paramsIndex = 0;

  for (let i = 0; i < sql.length; i++) {
    if (sql.charAt(i) === '?') {
      if (typeof params[paramsIndex] == 'string') {
        if (params[paramsIndex].lastIndexOf('[@]', 0) === 0) {
          final += StringUtils.replaceAll(params[paramsIndex], '[@]', '@');
        }
        else {
          final += "'" + StringUtils.replaceAll(params[paramsIndex], "'", "\\'") + "'";
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
};

/**
 * Converts a date to string.
 * @param date
 * @param timeZone
 * @return {string}
 */
function dateToString(date, timeZone) {
  let dt = new Date(date);

  if (timeZone && timeZone !== 'local') {
    let tz = convertTimezone(timeZone);

    dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
    if (tz !== false) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }
  }

  let year   = dt.getFullYear();
  let month  = zeroPad(dt.getMonth() + 1, 2);
  let day    = zeroPad(dt.getDate(), 2);
  let hour   = zeroPad(dt.getHours(), 2);
  let minute = zeroPad(dt.getMinutes(), 2);
  let second = zeroPad(dt.getSeconds(), 2);
  let millisecond = zeroPad(dt.getMilliseconds(), 3);

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
}

/**
 * Zero pad numbers.
 * @param number - The number.
 * @param length - The length.
 * @return {string}
 */
function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = '0' + number;
  }

  return number;
}

/**
 * Converts timezone.
 * @param tz
 * @return {boolean|number}
 */
function convertTimezone(tz) {
  if (tz === "Z") return 0;

  let m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
  }

  return false;
}
