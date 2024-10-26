const express = require("express");
const userProfileRoutes = require("./src/routes/userProfileRoutes");

const morgan = require("morgan");

const cors = require("cors");

const app = express();
app.use(cors());

require("dotenv").config({
  path: ".env"
});

// Import the cron job script to automatically delete expired stories

// body parser
app.use(express.json());

module.exports = app;
