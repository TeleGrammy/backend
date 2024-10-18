const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMS: 5 * 60 * 1000,
  max: 3,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message:
        "Too many password reset requests from this IP, please try again after 5 minutes",
    });
  },
});

module.exports = limiter;
