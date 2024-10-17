const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({
  path: ".env",
});

const authenticationRoute = require("./routes/authentication/authentication");

const globalErrorHandler = require("./middlewares/globalErrorHandling");

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(globalErrorHandler);

app.use("/api/v1/auth", authenticationRoute);

module.exports = app;
