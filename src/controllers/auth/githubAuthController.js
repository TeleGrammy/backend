const AppError = require("../../errors/appError");
const passport = require("passport");

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
        status: "Logged in with GitHub successfully",
      });
    }
  )(req, res);
});

module.exports = {
  signInWithGitHub,
  gitHubCallBack,
};
