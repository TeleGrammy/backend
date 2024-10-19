const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

/**
 * Utility function for handling the JWT generation for any request requires logging in.
 * @namespace Utils.TokenUtils
 */

/**
 * @method generateToken
 * @memberof Utils.TokenUtils
 * @param {Object}      [userTokenedData] - The information of the user for whom the token will be generated.
 * @param {String}      [tokenName] - The name of the token to be generated.
 * @returns {String}    The generated JWT containing the user's id
 */

const generateToken = (userTokenedData, tokenName) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "JWT secret is not defined in environment variables.",
      400
    );
  }

  let options = {};
  if (tokenName === process.env.COOKIE_ACCESS_NAME) {
    options = {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN_HOURS,
      issuer: "myapp",
      audience: "myapp-users",
    };
  } else if (tokenName === process.env.COOKIE_REFRESH_NAME) {
    options = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_DAYS,
      issuer: "myapp",
      audience: "myapp-users",
    };
  } else {
    throw new AppError("Unknown token name is passed", 500);
  }

  return jwt.sign(userTokenedData, process.env.JWT_SECRET, options);
};

module.exports = generateToken;
