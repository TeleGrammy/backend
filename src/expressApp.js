const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const requestIp = require("request-ip");
const passport = require("passport");
const MongoStore = require("connect-mongo");
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
const notificationRouter = require("./routes/notificaiton/notificaiton");
const channelRouter = require("./routes/channel/channel");
const groupRouter = require("./routes/group/groupRoutes");
const searchRouter = require("./routes/searchRoutes");

const callRouter = require("./routes/call/call");
const serversConfig = require("./config/serversConfig");
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
if (process.env.NODE_ENV === "test") {
  app.use(
    session({secret: "supersecretkey", resave: false, saveUninitialized: true})
  );
} else {
  app.use(
    session({
      secret: "supersecretkey",
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.DB_HOST,
        collectionName: "sessionsUsers",
      }),
      cookie: {
        secure: false, // Set true in production with HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );
}
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

app.use("/api/v1/search", isAuthenticated, searchRouter);

app.use("/api/v1/chats", chatRouter);

app.use("/api/v1/call", callRouter);
app.use("/ice-servers", serversConfig.getIceServers);

app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/groups", isAuthenticated, groupRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(globalErrorHandler);

module.exports = app;
