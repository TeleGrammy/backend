const AppError = require("../../errors/appError");
const passport = require("passport");

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

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
      });

      addAuthCookie(token, res);

      res.status(200).json({
        data: {
          token,
          user: {name: user.name},
        },
        status: "Logged in with Google successfully",
      });
    }
  )(req, res);
});

module.exports = {
  signInWithGoogle,
  googleCallBack,
};
