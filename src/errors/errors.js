const validationErrorHandler = require("./validationErrorHandler");
const duplicateKeyErrorHandler = require("./duplicateKeyErrorHandler");
const castErrorHandler = require("./castErrorHandler");

module.exports = (err) => {
  if (err.name === "ValidationError") return validationErrorHandler(err);
  if (err.code === 11000) return duplicateKeyErrorHandler(err);
  if (err.name === "CastError") return castErrorHandler(err);
  return err;
};
