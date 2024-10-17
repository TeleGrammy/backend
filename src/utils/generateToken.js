const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

/**
 * Utility function for handling the JWT generation for any request requires logging in.
 * @namespace Utils.TokenUtils
 */

/**
 * @method generateToken
 * @memberof Utils.TokenUtils
 * @param {String}      id - The id of the user for whom the token will be generated.
 * @returns {String}    token - The generated JWT containing the user's id
 */

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "JWT secret is not defined in environment variables.",
      500
    );
  }

  const token = jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN_HOURS || "24h",
    algorithm: "HS256",
  });

  return token;
};

module.exports = generateToken;
