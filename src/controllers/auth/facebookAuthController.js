const passport = require("passport");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");
const manageSessionForUser = require("../../utils/sessionManagement");

const signInWithFaceBook = (req, res, next) => {
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
    accessType: "offline",
  })(req, res, next);
};

const faceBookCallBack = catchAsync(async (req, res, next) => {
  passport.authenticate(
    "facebook",
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
          password: "facebook_user",
          passwordConfirm: "facebook_user",
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          status: "active",
          picture: user.profilePicture || "",
          accessTokenExpiresAt: new Date(Date.now() + 3600 * 100),
          refreshTokenExpiresAt: refreshTokenExpiration,
          isFaceBookUser: true,
        });
      } else {
        existingUser.accessToken = user.accessToken;
        existingUser.refreshToken = user.refreshToken;
        existingUser.accessTokenExpiresAt = new Date(Date.now() + 3600 * 100);
        existingUser.refreshTokenExpiresAt = refreshTokenExpiration;
        existingUser.status = "active";
        await existingUser.save({validateBeforeSave: false});
      }

      const {updatedUser, accessToken} = await manageSessionForUser(
        req,
        res,
        existingUser
      );

      return res.status(200).json({
        data: {
          updatedUser,
          accessToken,
        },
        status: "Logged in successfully with FaceBook",
      });
    }
  )(req, res);
});

module.exports = {
  signInWithFaceBook,
  faceBookCallBack,
};
