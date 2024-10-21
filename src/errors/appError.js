class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperationalError = true; // Not a programming error

    Error.captureStackTrace(this, this.constructor);
  }
}
exports.AppError = AppError;

const handleCastError = err => {
  if (err.path === "_id") err.path = "id";
  err.message = `Invalid ${err.path}: ${err.value}.`;
  err.status = "fail";
  err.statusCode = 400;
};

const handleDuplicateError = err => {
  err.statusCode = 400;
  err.message = `${err.keyPattern} already used.`;
};
exports.handleError = (appError, req, res) => {
  console.log(appError);
  if (appError.name === "CastError") handleCastError(appError);
  if (appError.codeName === "DuplicateKey") handleDuplicateError(appError);
  res.status(appError.statusCode || 500).json({
    status: appError.status || "error",
    message: appError.message || "Something went wrong"
  });
};
