const AppError = require("./appError");

module.exports = (err) => {
  const field = err.keyValue;
  const key = Object.keys(field)[0]; 
  console.log(key);
  const message = `Duplicate field value: ${key}. please use another value! `;
  return new AppError(message, 400);
};
