const globalErrorHandler = (err, req, res, next) => {
  const error = new Error(err.message);
  error.name = err.name;
  error.stack = err.stack;
  Object.assign(error, {...err});

  error.statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  error.status = String(error.statusCode).startsWith("4") ? "fail" : "error";

  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error,
    });
  }
};

module.exports = globalErrorHandler;
