const express = require("express");
require("dotenv").config({
  path: ".env",
});

const cors = require("cors");

const app = express();
app.use(cors());

module.exports = app;
