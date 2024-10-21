const passport = require("passport");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");
const addAuthCookie = require("../../utils/addAuthCookie");
const generateToken = require("../../utils/generateToken");

const signInWithGitHub = (req, res, next) => {
  passport.authenticate("github", {
    scope: ["user:email", "user"],
    accessType: "offline",
  })(req, res, next);
};

const gitHubCallBack = catchAsync(async (req, res, next) => {
  passport.authenticate(
    "github",
    {failureRedirect: "/login"},
    async (err, user) => {
      if (err || !user) {
        return next(new AppError("Authentication failed", 401));
      }

      let existingUser = await userService.getUserByEmail(user.email);
      if (!existingUser) {
        existingUser = await userService.createUser({
          username: user.name,
          phone: user.phone,
          email: user.email,
          password: "github_user",
          passwordConfirm: "github_user",
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          picture: user.profilePicture || "",
          accessTokenExpiresAt: new Date(Date.now() + 3600 * 100),
          isGitHubUser: true,
        });
      } else {
        existingUser.accessToken = user.accessToken;
        existingUser.refreshToken = user.refreshToken;
        existingUser.accessTokenExpiresAt = new Date(Date.now() + 3600 * 100);
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

      return res.redirect("/api/v1/user/");
    }
  )(req, res);
});

module.exports = {
  signInWithGitHub,
  gitHubCallBack,
};
