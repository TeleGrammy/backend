const express = require("express");
const userProfileRoutes = require("./src/routes/userProfileRoutes");

const morgan = require("morgan");
require("dotenv").config({
  path: ".env"
});

// Import the cron job script to automatically delete expired stories
require("./src/middlewares/cronJobs");

const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// body parser
app.use(express.json({limit: "10kb"}));

app.use("/api/v1/users/profile", userProfileRoutes);

module.exports = app;
