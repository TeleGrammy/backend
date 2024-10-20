const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config({
  path: ".env",
});

require("./middlewares/strategies/index");

const authenticationRouter = require("./routes/authentication/authentication");
const userRouter = require("./routes/user/user");

const globalErrorHandler = require("./middlewares/globalErrorHandling");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authenticationRouter);

app.use(globalErrorHandler);

module.exports = app;
