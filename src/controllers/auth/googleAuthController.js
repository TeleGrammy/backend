const passport = require("passport");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");
const manageSessionForUser = require("../../utils/sessionManagement");

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

      const {updatedUser, accessToken} = await manageSessionForUser(
        req,
        res,
        existingUser
      );

      return res.cookie('accessToken',accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 60 * 60 * 1000 })
                .redirect(process.env.FRONTEND_LOGIN_CALLBACK);
});

module.exports = {
  signInWithGoogle,
  googleCallBack,
};
