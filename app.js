const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({
  path: ".env",
});

const globalErrorHandler = require("./src/middlewares/globalErrorHandling");
const authenticationRoutes = require("./src/routes/authenticationRoutes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/api/v1/auth", authenticationRoutes);

app.use(globalErrorHandler);

module.exports = app;
