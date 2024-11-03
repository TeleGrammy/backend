const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const requestIp = require("request-ip");
const passport = require("passport");
const {swaggerUi, specs} = require("../swaggerConfig");

require("dotenv").config({
  path: "../env",
});

require("./middlewares/strategies/index");

const authenticationRouter = require("./routes/authentication/authentication");
const userRouter = require("./routes/user/user");
const chatRouter = require("./routes/chat/chat");

const globalErrorHandler = require("./middlewares/globalErrorHandling");

const app = express();

app.set("trust-proxy", true);
app.set(requestIp.mw());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  session({secret: "supersecretkey", resave: false, saveUninitialized: true})
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authenticationRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(globalErrorHandler);

module.exports = app;
