const validator = require("validator");
const AppError = require("../errors/appError");

const PendingUser = require("../models/pending-user");

const findUserByEmail = (email) => {
  if (typeof email !== "string") {
    throw new AppError("Email must be a string", 400);
  }
  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }
  return PendingUser.findOne({email});
};

module.exports = {
  findUserByEmail,
};
