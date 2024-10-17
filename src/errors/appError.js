class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = `${statusCode}`.startsWith(4)
      ? "Failed"
      : "Error occurred";

    this.isOperationalError = true; // Not a programming error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
