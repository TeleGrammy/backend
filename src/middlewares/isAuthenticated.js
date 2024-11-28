const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

const catchAsync = require("../utils/catchAsync");

const generateToken = require("../utils/generateToken").default;
const addAuthCookieModule = require("../utils/addAuthCookie").default;
const isLoggedOutModule = require("../utils/isLoggedOut");

const userService = require("../services/userService");
const sessionService = require("../services/sessionService");

module.exports = catchAsync(async (req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://telegrammy.tech",
    "https://telegrammy.tech",
  ];
  const {origin} = req.headers;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  const currentDeviceType = req.headers["user-agent"];

  const accessToken =
    req.cookies[process.env.COOKIE_ACCESS_NAME] ||
    req.headers.Authorization?.replace("Bearer ", "") ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return next(new AppError("Not authorized access, Please login!", 401));
  }

  let decodedAccessToken = null;

  try {
    decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const currentUserId = jwt.decode(accessToken, {complete: true}).id;
      const currentSessionData =
        await sessionService.findSessionByUserIdAndDevice(
          currentUserId,
          currentDeviceType
        );

      let decodedRefreshToken = null;
      try {
        decodedRefreshToken = jwt.verify(
          currentSessionData.refreshToken,
          process.env.JWT_SECRET
        );
      } catch (err) {
        return next(
          new AppError("Invalid refresh token, please log in again", 401)
        );
      }

      const user = await userService.getUserBasicInfoByUUID(
        decodedRefreshToken.name
      );

      if (!user) {
        return next(new AppError("User not found, please login again", 401));
      }

      const userTokenedData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loggedOutFromAllDevicesAt: decodedAccessToken.loggedOutFromAllDevicesAt,
      };

      const newAccessToken = generateToken(
        userTokenedData,
        process.env.COOKIE_ACCESS_NAME
      );

      const newRefreshToken = generateToken(
        userTokenedData,
        process.env.COOKIE_REFRESH_NAME
      );

      const newSessionData = {
        ip: (req.headers["x-forwarded-for"] || req.ip).split(",")[0].trim(),
        deviceType: req.headers["user-agent"],
        userId: user._id,
        newRefreshToken,
      };

      const newSession = await sessionService.createSession(newSessionData);

      try {
        await sessionService.findSessionByUserIdAndUpdate(
          user._id,
          currentDeviceType,
          newSession
        );
      } catch (err) {
        return next(err);
      }

      addAuthCookieModule.default(newAccessToken, res, true);
      req.user = decodedRefreshToken;
      req.user.currentSession = currentSessionData;

      return next();
    }
    return next(new AppError("Invalid access token", 401));
  }

  const user = await userService.getUserBasicInfoByUUID(
    decodedAccessToken.name
  );
  if (!user) {
    return next(new AppError("Unauthorized access", 401));
  }

  const currentSession = await sessionService.findSessionByUserIdAndDevice(
    user._id,
    currentDeviceType
  );
  if (await isLoggedOutModule.default(decodedAccessToken)) {
    await sessionService.deleteSession(currentSession._id, currentDeviceType);

    res.clearCookie(process.env.COOKIE_ACCESS_NAME, {
      httpOnly: true,
      secure: true,
    });

    return next(
      new AppError("Unauthorized access, all devices are logged out", 401)
    );
  }

  req.user = decodedAccessToken;
  req.user.currentSession = currentSession;
  next();
});
