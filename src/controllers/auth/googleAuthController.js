const passport = require("passport");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");
const manageSessionForUserModule = require("../../utils/sessionManagement");

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
      console.log("GOOGLE user:", user);
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
          isAdmin: user.email === process.env.APP_EMAIL,
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
      const {accessToken} = await manageSessionForUserModule.default(
        req,
        res,
        existingUser
      );

      let adminStatus = false;
      if (existingUser.isAdmin) {
        adminStatus = existingUser.isAdmin;
      }

      return res
        .status(300)
        .redirect(
          `${process.env.FRONTEND_LOGIN_CALLBACK}?accessToken=${accessToken}&isAdmin=${adminStatus}`
        );
    }
  )(req, res);
});

module.exports = {
  signInWithGoogle,
  googleCallBack,
};
