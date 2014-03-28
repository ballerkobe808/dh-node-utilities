// require cheerio for html parsing.
var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');

/**
 * Builds a cookie jar object with the specified cookie key value pair.
 * @param cookieName - the name of the cookie.
 * @param cookieValue - The value of the cookie.
 * @return {*} - The CookieJar object.
 */
exports.buildCookieJar = function (cookieName, cookieValue) {

    // get a new cookie jar object.
    var cookiejar = request.jar();

    // build the cookie.
    var cookie = request.cookie(cookieName);
    cookie.value = cookieValue;

    // add the cookie to the cookie jar.
    cookiejar.add(cookie);

    // return it.
    return cookiejar;
};

/**
 * Checks if the token from domino is in the request cookies array.
 * @param request - The request object.
 * @param tokenName - The name of the domino session token.
 * @returns {boolean} - If the LtpaToken exists in the cookies array.
 */
exports.hasDominoSessionCookie = function (request, tokenName) {
    return (!_.isUndefined(request.cookies) && !_.isUndefined(request.cookies[tokenName]) && !_.isEmpty(request.cookies[tokenName]));
};

/**
 * Checks if the title of the page is the same as the specified title.
 * @param title - The title to compare with.
 * @param body - The body of the page.
 * @returns {boolean}
 */
exports.titleEquals = function(title, body) {
  // load the html into a cheerio object.
  $ = cheerio.load(body);

  // get a reference to the page title.
  var pageTitle = $('title');

  // make sure the page title is a valid tag.
  if (pageTitle !== undefined && pageTitle.length > 0 && pageTitle.children !== undefined && pageTitle.children.length > 0) {

    // get the data from the title tag.
    var pageTitleValue = pageTitle[0].children[0].data;

    // check if the data is the RCUH vendor registration text.
    if (pageTitleValue !== undefined && pageTitleValue.toLowerCase() === title.toString().toLowerCase())
      return true;
  }

  // child only get here if the page title isn't RCUH Login
  return false;
};