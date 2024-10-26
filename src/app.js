const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const {swaggerUi, specs} = require("../swaggerConfig");
const cronJobs = require("./middlewares/cronJobs");

const morgan = require("morgan");

require("dotenv").config({
  path: "../env",
});

require("./middlewares/strategies/index");

const authenticationRouter = require("./routes/authentication/authentication");
const userRouter = require("./routes/user/user");
const userProfileRouter = require("./routes/userProfile/userProfile");
const globalErrorHandler = require("./middlewares/globalErrorHandling");

const app = express();

// use cron job script to automatically delete expired stories
cronJobs();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authenticationRouter);
app.use("/api/v1/user/profile", userProfileRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(globalErrorHandler);

module.exports = app;
