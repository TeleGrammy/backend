const passport = require("passport");
const bcrypt = require("bcryptjs");

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
        const hashedPassword = await bcrypt.hash("google", 12);

        existingUser = await userService.createUser({
          username: user.name,
          phone: user.phone,
          email: user.email,
          password: hashedPassword,
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
        await existingUser.save();
      }

      const accessToken = generateToken(
        {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
        process.env.COOKIE_ACCESS_NAME
      );

      const refreshToken = generateToken(
        {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
        process.env.COOKIE_REFRESH_NAME
      );

      addAuthCookie(accessToken, res, true);
      addAuthCookie(refreshToken, res, false);

      res.status(200).json({
        data: {
          user: {name: existingUser.name},
          refreshToken,
          accessToken,
        },
        status: "Logged in with Google successfully",
      });
    }
  )(req, res);
});

module.exports = {
  signInWithGitHub,
  gitHubCallBack,
};
