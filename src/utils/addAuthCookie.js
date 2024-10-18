/**
 * Utility function for handling the JWT generation for any request requires logging in.
 * @namespace Utils.CookieUtils
 */

/**
 * @method addAuthCookie
 * @memberof Utils.CookieUtils
 * @param {String}      token - The generated JWT containing the user's id.
 * @param {Object}      res - The response object wo which the cookie will be added.
 * @returns {Object}    The updated response object with the added cookie.
 */

const addAuthCookie = (token, res) => {
  const cookieExpirationDate = new Date(
    Date.now() + process.env.EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  );

  res.cookie(process.env.COOKIE_NAME, token, {
    expires: cookieExpirationDate,
    httpOnly: true,
  });

  return res;
};

module.exports = addAuthCookie;
