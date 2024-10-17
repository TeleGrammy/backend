const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({
  path: ".env"
});
const globalErrorHandler = require("./src/middlewares/globalErrorHandling");

const registrationRoute = require("./src/routes/authentication/registration");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/api/v1/auth",registrationRoute);


app.use(globalErrorHandler);

module.exports = app;
