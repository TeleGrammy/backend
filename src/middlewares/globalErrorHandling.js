const errors = require("../errors/errors");

const globalErrorHandler = (err, req, res, next) => {
  const error = errors(err);
  console.log("ERROR:", err);
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(error.statusCode || 500).json({
      status: "error",
      error,
    });
  }
};

module.exports = globalErrorHandler;
