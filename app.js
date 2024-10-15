const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({
  path: ".env",
});

const globalErrorHandler = require("./src/middlewares/globalErrorHandling");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(globalErrorHandler);

module.exports = app;
