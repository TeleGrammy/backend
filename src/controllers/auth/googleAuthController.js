const passport = require("passport");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");
const addAuthCookie = require("../../utils/addAuthCookie");
const generateToken = require("../../utils/generateToken");

const signInWithGoogle = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["email", "profile"],
    accessType: "offline",
  })(req, res, next);
};

const googleCallBack = catchAsync(async (req, res, next) => {
  passport.authenticate(
    "google",
    {failureRedirect: "/login"},
    async (err, user) => {
      if (err || !user) {
        return next(new AppError("Authentication failed", 401));
      }

      let existingUser = await userService.getUserByEmail(user.email);

      const refreshTokenExpiration = new Date();
      refreshTokenExpiration.setMonth(refreshTokenExpiration.getMonth() + 6);

      if (!existingUser) {
        existingUser = await userService.createUser({
          username: user.name,
          phone: user.phone,
          email: user.email,
          password: "google_user",
          passwordConfirm: "google_user",
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          picture: user.profilePicture || "",
          accessTokenExpiresAt: new Date(Date.now() + 3600 * 100),
          refreshTokenExpiresAt: refreshTokenExpiration,
          isGoogleUser: true,
        });
      } else {
        existingUser.accessToken = user.accessToken;
        existingUser.refreshToken = user.refreshToken;
        existingUser.accessTokenExpiresAt = new Date(Date.now() + 3600 * 100);
        existingUser.refreshTokenExpiresAt = refreshTokenExpiration;
        await existingUser.save({validateBeforeSave: false});
      }

      const userTokenedData = {
        id: existingUser.id,
        name: existingUser.username,
        email: existingUser.email,
        phone: existingUser.phone,
        loggedOutFromAllDevicesAt: existingUser.loggedOutFromAllDevicesAt,
      };

      const accessToken = generateToken(
        userTokenedData,
        process.env.COOKIE_ACCESS_NAME
      );

      const refreshToken = generateToken(
        userTokenedData,
        process.env.COOKIE_REFRESH_NAME
      );

      addAuthCookie(accessToken, res, true);
      addAuthCookie(refreshToken, res, false);

      return res.redirect("/api/v1/user");
    }
  )(req, res);
});

module.exports = {
  signInWithGoogle,
  googleCallBack,
};
