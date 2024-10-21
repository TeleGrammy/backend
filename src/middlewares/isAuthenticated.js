const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

const catchAsync = require("../utils/catchAsync");

const generateToken = require("../utils/generateToken");
const addAuthCookie = require("../utils/addAuthCookie");
const userService = require("../services/userService");
const isLoggedOut = require("../utils/isLoggedOut");

module.exports = catchAsync(async (req, res, next) => {
  const accessToken = req.cookies[process.env.COOKIE_ACCESS_NAME];
  const refreshToken = req.cookies[process.env.COOKIE_REFRESH_NAME];

  if (!accessToken) {
    return next(new AppError("Unauthorized access, please log in", 401));
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      if (!refreshToken) {
        return next(new AppError("Token expired, please log in again", 401));
      }

      let decodedRefreshToken;
      try {
        decodedRefreshToken = await jwt.verify(
          refreshToken,
          process.env.JWT_SECRET
        );
      } catch (error) {
        return next(
          new AppError("Invalid refresh token, please log in again", 401)
        );
      }

      const user = await userService.getUserBasicInfoByUUID(
        decodedRefreshToken.name
      );
      if (!user) {
        return next(new AppError("User not found, please log in again", 401));
      }

      const userTokenedData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loggedOutFromAllDevicesAt: decodedToken.loggedOutFromAllDevicesAt,
      };

      const newAccessToken = generateToken(
        userTokenedData,
        process.env.COOKIE_ACCESS_NAME
      );

      const newRefreshToken = generateToken(
        userTokenedData,
        process.env.COOKIE_REFRESH_NAME
      );

      addAuthCookie(newAccessToken, res, true);
      addAuthCookie(newRefreshToken, res, false);

      await userService.updateRefreshToken(user._id, newRefreshToken);

      req.user = decodedRefreshToken;
      return next();
    }
    return next(new AppError("Invalid token, please log in again", 401));
  }

  const user = await userService.getUserBasicInfoByUUID(decodedToken.name);

  if (!user) {
    return next(new AppError("Unauthorized access", 401));
  }

  if (await isLoggedOut(decodedToken)) {
    res.clearCookie(process.env.COOKIE_ACCESS_NAME, {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie(process.env.COOKIE_REFRESH_NAME, {
      httpOnly: true,
      secure: true,
    });

    return next(
      new AppError("Unauthorized access, all devices are logged out", 401)
    );
  }

  req.user = decodedToken;
  return next();
});
