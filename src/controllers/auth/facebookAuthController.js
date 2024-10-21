const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const userService = require("../../services/userService");
const AppError = require("../../errors/appError");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const addAuthCookie = require("../../utils/addAuthCookie");

// Passport's serialization setup
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Facebook strategy setup
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.APP_ID,
      clientSecret: process.env.APP_SECRET,
      callbackURL: "http://localhost:8080/api/v1/auth/facebook/callback",
      profileFields: ["id", "name", "profileUrl", "displayName", "email"],
    },
    async function (accessTokenFab, refreshTokenFab, profile, done) {
      // Here, you can save the user profile info in your database

      console.log("Access Token:");
      console.log(accessTokenFab);
      console.log("Refresh: ");
      console.log(refreshTokenFab);
      console.log("Profile:");
      console.log(profile);
      const id = profile.id;
      const email = `${id}@facebook.com`;
      if (!accessTokenFab || !profile) {
        return next(new AppError("Authentication failed", 401));
      }

      let existingUser = await userService.getUserByEmail(user.email);

      const refreshTokenExpiration = new Date();
      refreshTokenExpiration.setMonth(refreshTokenExpiration.getMonth() + 6);

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
          refreshTokenExpiresAt: refreshTokenExpiration,
          isGoogleUser: true,
        });
      } else {
        existingUser.accessToken = user.accessToken;
        existingUser.refreshToken = user.refreshToken;
        existingUser.accessTokenExpiresAt = new Date(Date.now() + 3600 * 100);
        existingUser.refreshTokenExpiresAt = refreshTokenExpiration;
        await existingUser.save();
      }

      const accessToken = generateToken(
        {
          id: existingUser.id,
          name: existingUser.username,
          email: existingUser.email,
        },
        process.env.COOKIE_ACCESS_NAME
      );

      const refreshToken = generateToken(
        {
          id: existingUser.id,
          name: existingUser.username,
          email: existingUser.email,
        },
        process.env.COOKIE_REFRESH_NAME
      );

      addAuthCookie(accessToken, res, true);
      addAuthCookie(refreshToken, res, false);

      res.redirect("/api/v1/user");


      return done(null, profile);
    }
  )
);

const facebookLogin = passport.authenticate("facebook", {
  scope: ["public_profile"],
});

const facebookCallback = passport.authenticate("facebook", {
  successRedirect: "/api/v1/user/",
  failureRedirect: "/",
});

module.exports = {
  facebookLogin,
  facebookCallback,
};
