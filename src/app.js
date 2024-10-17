const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({
  path: ".env",
});

const authenticationRoute = require("./routes/authentication/authentication");

const globalErrorHandler = require("./middlewares/globalErrorHandling");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(globalErrorHandler);

app.use("/api/v1/auth/authentication", authenticationRoute);

module.exports = app;
