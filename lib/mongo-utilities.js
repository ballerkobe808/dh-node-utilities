'use strict';

// dependencies.
var _ = require('underscore');

/**
 * Builds the mongo URI string.
 * @param server - The server address.
 * @param port - The servers port number. Defaults to 27017.
 * @param user - The username if authentication is on.
 * @param pass - The password if authentication is on.
 * @return String - The connection string.
 */
exports.buildMongoURIString = function (server, port, user, pass) {
  // initialize the uri to empty string.
  var uri = '';

  // get the port number
  var portNumber = port ? port : '27017';

  // get the auth string.
  var authString = '';
  if (!_.isUndefined(user) && !_.isNull(user) && !_.isUndefined(pass) && !_.isNull(pass)) {
    authString = user + ':' + pass + '@';
  }

  // put the connection string together.
  uri = authString + server + ':' + portNumber;

  // return the string.
  return uri;
};