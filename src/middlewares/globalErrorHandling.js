const globalErrorHandler = (err, req, res) => {
  const error = new Error(err.message);
  error.name = err.name;
  error.stack = err.stack;
  Object.assign(error, {...err});

  error.statusCode = error.statusCode || 500;
  error.status = error.statusCode.toString().startsWith("4") ? "fail" : "error";

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
