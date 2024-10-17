class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = this.statusCode.toString().startWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
