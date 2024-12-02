class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = this.statusCode.toString().startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
