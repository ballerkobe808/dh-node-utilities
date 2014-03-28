// dependencies
var errorUtilities = require('./error-utilities');

/**
 * Builds the insert statement with placeholders using a key value parameter list.
 * @param tableName - The name of the table to insert into.
 * @param parameters - The key value parameter array.
 * @returns {string} - The sql string.
 */
exports.buildInsertStatement  = function (tableName, parameters) {
  var sql = 'INSERT INTO ' + tableName;

  // check that there are parameters.
  if (Object.keys(parameters).length) {
    // build the parameter lists.
    var columnNamesString = '';
    var valuePlaceHolders = '';

    // keep track of the current index.
    var index = 0;

    // loop over all the keys.
    for (var key in parameters) {
      columnNamesString += key;
      valuePlaceHolders += '?';

      // increment the index.
      index++;

      // if its not the last parameter, add a comma.
      if (index != Object.keys(parameters).length) {
        columnNamesString += ', ';
        valuePlaceHolders += ', ';
      }
    }

    // connect it to the initial statement.
    sql += ' (' + columnNamesString + ') VALUES (' + valuePlaceHolders + ')';
  }

  return sql;
};

/**
 * Converts a key value array or object into an array of just the values.
 * Note: use this in combination with the buildInsertStatement function to keep the values and columns in order.
 * @param obj
 * @returns {Array}
 */
exports.objectToValueArray = function (obj) {
  var results = [];

  for (var key in obj) {
    results.push(obj[key]);
  }

  return results;
};

/**
 * Performs data insert on AS400.
 * @param tableName - The name of the table to insert to.
 * @param parameters - The parameters object of key/value pairs.
 * @param callback - The callback function. callback(err);
 */
exports.insertData = function (tableName, parameters, callback) {
  var sql = this.buildInsertStatement(tableName, parameters);
  var values = this.objectToValueArray(parameters);

  // execute the statement.
  this.executeUpdatePreparedStatement(sql, values, function(err) {
    // check if an error occurred.
    if (err) {
      return callback(err);
    }

    callback(null);
  });
};

/**
 * Executes a sql string on the AS400.
 * @param sql - The sql statement.
 * @param connectionUrl - The url connection string for the as400.
 * @param callback
 */
exports.executeSqlString = function (sql, connectionUrl, callback) {
  // get a reference to the jdbc driver.
  var jdbc = require('dh-400jdbc')();

  //set jdbc config
  var config = {
    url: connectionUrl
  };

  // set callback for jdbc execute function
  //.. parse the JSON data for the response
  //.. because this is an async call, this will fire off the close SQL call
  var prepareStatement = function (err, results) {
    // check if an error occurred.
    if (err) {
      jdbc.close();
      callback(errorUtilities.AS400Error('Prepared statement failed.', err));
      return;
    }
    else if (results) {
      // close the jdbc connection.
      jdbc.close();

      // pass the vendor data to the callback function.
      callback(null, results);
      return;
    }
    else {
      callback(errorUtilities.AS400Error('No results returned.'));
      return;
    }
  };

  // jdbc init callback function
  var init = function (err) {
    // check if an error occurred.
    if (err) {
      callback(errorUtilities.AS400Error('JDBC initialize failed.', err));
      jdbc.close();
      return;
    }

    // check that jdbc is initialized.
    if (jdbc) {
      jdbc.execute(sql);
    }
    else {
      callback(errorUtilities.AS400Error('JDBC module is undefined.'));
      return;
    }
  };

  // jdbc close callback function
  var close = function () {
    // remove all the listeners.
    jdbc.removeListener('prepareStatement', prepareStatement);
    jdbc.removeListener('execute', prepareStatement);
    jdbc.removeListener('init', init);
    jdbc.removeListener('close', close);
  };

  //set callback for jdbc initialize function
  //.. because this is an async call, this will fire off the execute SQL call
  jdbc.on('init', init);

  //set callback for jdbc execute function
  jdbc.on('prepareStatement', prepareStatement);
  jdbc.on('execute', prepareStatement);

  //set callback for jdbc close function
  jdbc.on('close', close);

  //initialize jdbc - see jdbc.on('init', callback)
  jdbc.initialize(config);
};


/**
 * Executes a sql string on the AS400.
 * @param sql - The sql query.
 * @prarm parameters - Array of parameters.
 * @param connectionUrl - The as400 connection url string.
 * @param callback
 */
exports.executePreparedStatement = function (sql, parameters, connectionUrl, callback) {
  // get a reference to the jdbc driver.
  var jdbc = require('dh-400jdbc')();

  //set jdbc config
  var config = {
    url: connectionUrl
  };

  // set callback for jdbc execute function
  //.. parse the JSON data for the response
  //.. because this is an async call, this will fire off the close SQL call
  var prepareStatement = function (err, results) {
    // check if an error occurred.
    if (err) {
      jdbc.close();
      callback(errorUtilities.AS400Error('Prepared statement failed.', err));
      return;
    }

    // close the jdbc connection.
    jdbc.close();

    // pass the vendor data to the callback function.
    callback(null, results);
    return;
  };

  // jdbc init callback function
  var init = function (err) {
    // check if an error occurred.
    if (err) {
      callback(errorUtilities.AS400Error('JDBC initialize failed.', err));
      jdbc.close();
      return;
    }

    // check that jdbc is initialized.
    if (jdbc) {
      jdbc.prepareStatementWithParameterArray(sql, parameters);
    }
    else {
      callback(errorUtilities.AS400Error('JDBC module is undefined.'));
      return;
    }
  };

  // jdbc close callback function
  var close = function () {
    // remove all the listeners.
    jdbc.removeListener('prepareStatement', prepareStatement);
    jdbc.removeListener('execute', prepareStatement);
    jdbc.removeListener('init', init);
    jdbc.removeListener('close', close);
  };

  //set callback for jdbc initialize function
  //.. because this is an async call, this will fire off the execute SQL call
  jdbc.on('init', init);

  //set callback for jdbc execute function
  jdbc.on('prepareStatement', prepareStatement);
  jdbc.on('execute', prepareStatement);

  //set callback for jdbc close function
  jdbc.on('close', close);

  //initialize jdbc - see jdbc.on('init', callback)
  jdbc.initialize(config);
};

/**
 * Executes a sql string on the AS400.
 * @param sql - the sql string.
 * @param parameters - The array of parameters.
 * @oaram connectionUrl - The as400 connection string.
 * @param callback
 */
exports.executeUpdatePreparedStatement = function (sql, parameters, connectionUrl, callback) {
  // get a reference to the jdbc driver.
  var jdbc = require('dh-400jdbc')();

  //set jdbc config
  var config = {
    url: connectionUrl
  };

  // set callback for jdbc execute function
  //.. parse the JSON data for the response
  //.. because this is an async call, this will fire off the close SQL call
  var prepareStatement = function (err) {
    // check if an error occurred.
    if (err) {
      jdbc.close();
      callback(errorUtilities.AS400Error('Prepared statement failed.', err));
      return;
    }

    // close the jdbc connection.
    jdbc.close();

    // pass the vendor data to the callback function.
    callback(null);
    return;
  };

  // jdbc init callback function
  var init = function (err) {
    // check if an error occurred.
    if (err) {
      callback(errorUtilities.AS400Error('JDBC initialize failed.', err));
      jdbc.close();
      return;
    }

    // check that jdbc is initialized.
    if (jdbc) {
      jdbc.prepareStatementUpdateWithParameterArray(sql, parameters);
    }
    else {
      callback(errorUtilities.AS400Error('JDBC module is undefined.'));
      return;
    }
  };

  // jdbc close callback function
  var close = function () {
    // remove all the listeners.
    jdbc.removeListener('prepareStatement', prepareStatement);
    jdbc.removeListener('execute', prepareStatement);
    jdbc.removeListener('init', init);
    jdbc.removeListener('close', close);
  };

  //set callback for jdbc initialize function
  //.. because this is an async call, this will fire off the execute SQL call
  jdbc.on('init', init);

  //set callback for jdbc execute function
  jdbc.on('prepareStatement', prepareStatement);
  jdbc.on('execute', prepareStatement);

  //set callback for jdbc close function
  jdbc.on('close', close);

  //initialize jdbc - see jdbc.on('init', callback)
  jdbc.initialize(config);
};