const AppError = require("./appError");

module.exports = (err) => {
  const {message} = err;
  return new AppError(message, 400);
};
