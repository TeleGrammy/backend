const validationErrorHandler = require("./validationErrorHandler");
const duplicateKeyErrorHandler = require("./duplicateKeyErrorHandler");

module.exports = (err) => {
  if (err.name === "ValidationError") return validationErrorHandler(err);
  if (err.code === 11000) return duplicateKeyErrorHandler(err);
  return err;
};
