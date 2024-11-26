/**
 * Utility function for handling the JWT generation for any request requires logging in.
 * @namespace Utils.CookieUtils
 */

/**
 * @method addAuthCookie
 * @memberof Utils.CookieUtils
 * @param {String}      [token] - The generated JWT containing the user's id.
 * @param {Object}      [res] - The response object wo which the cookie will be added.
 * @param {Boolean}     [isAccessToken] - A flag that if the access token is the token needed to be added to the cookie.
 * @returns {Object}    The updated response object with the added cookie.
 */

const addAuthCookie = (token, res, isAccessToken = true) => {
  const time = isAccessToken
    ? process.env.COOKIE_ACCESS_EXPIRES_IN_HOURS * 60 * 60 * 1000
    : process.env.COOKIE_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

  const options = {
    expires: new Date(Date.now() + time),
    httpOnly: true,
    SameSite: "Strict",
  };

  const cookieName = isAccessToken
    ? process.env.COOKIE_ACCESS_NAME
    : process.env.COOKIE_REFRESH_NAME;

  res.cookie(cookieName, token, options);

  return res;
};

module.exports.default = addAuthCookie;
