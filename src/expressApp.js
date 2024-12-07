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
const userProfileRouter = require("./routes/userProfile/userProfile");
const userPrivacyRouter = require("./routes/userPrivacy/userPrivacy");
const storyRouter = require("./routes/userProfile/story");
const mediaRouter = require("./routes/messaging/media");
const chatRouter = require("./routes/chat/chat");
const channelRouter = require("./routes/channel/channel");
const groupRouter = require("./routes/group/groupRoutes");

const globalErrorHandler = require("./middlewares/globalErrorHandling");
const isAuthenticated = require("./middlewares/isAuthenticated");

const app = express();

app.set("trust-proxy", true);
app.set(requestIp.mw());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use(
  session({secret: "supersecretkey", resave: false, saveUninitialized: true})
);

app.use(cookieParser());
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authenticationRouter);
app.use("/api/v1/user/profile", userProfileRouter);
app.use("/api/v1/user/stories", storyRouter);

app.use("/api/v1/messaging/upload", isAuthenticated, mediaRouter);
app.use("/api/v1/privacy/settings", userPrivacyRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/groups", isAuthenticated, groupRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(globalErrorHandler);

module.exports = app;
