const AppError = require("./appError");

module.exports = (err) => {
  const field = err.keyValue.name;
  const message = `Duplicate field value: ${field}. please use another value! `;
  return new AppError(message, 400);
};
