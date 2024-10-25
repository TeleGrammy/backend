const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const userService = require("../../services/userService");
const generateToken = require("../../utils/generateToken");
const addAuthCookie = require("../../utils/addAuthCookie");

passport.serializeUser((user, done) => {
  console.log("SER: ", user);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  console.log("DESER: ", id);
  return done(null, id);
});

// Facebook strategy setup
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:8080/api/v1/auth/facebook/callback",
      profileFields: ["id", "name", "displayName", "email"],
    },
    async function (accessTokenFab, refreshTokenFab, profile, done) {
      const userData = profile._json;
      const {id, name, email} = userData;

      let existingUser = await userService.getUserByEmail(email);

      const refreshTokenExpiration = new Date();
      refreshTokenExpiration.setMonth(refreshTokenExpiration.getMonth() + 6);

      if (!existingUser) {
        existingUser = await userService.createUser({
          username: name,
          email,
          password: "facebook_user",
          passwordConfirm: "facebook_user",
          id,
          accessToken: accessTokenFab,
          refreshToken: refreshTokenFab,
          accessTokenExpiresAt: new Date(Date.now() + 3600 * 100),
          refreshTokenExpiresAt: refreshTokenExpiration,
          isFaceBookUser: true,
        });
      } else {
        existingUser.accessToken = accessTokenFab;
        existingUser.refreshToken = refreshTokenFab;
        existingUser.accessTokenExpiresAt = new Date(Date.now() + 3600 * 100);
        existingUser.refreshTokenExpiresAt = refreshTokenExpiration;
        await existingUser.save({validateBeforeSave: false});
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

      return done(null, {user: existingUser, accessToken, refreshToken});
    }
  )
);

const facebookLogin = passport.authenticate("facebook", {
  scope: ["public_profile", "email"],
});

const facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", {session: false}, (err, result) => {
    const {user, accessToken, refreshToken} = result;
    if (err || !user) {
      return res.status(401).json({error: "Authentication failed"});
    }

    addAuthCookie(accessToken, res, true);
    addAuthCookie(refreshToken, res, false);

    return res.redirect("/api/v1/user");
  })(req, res, next);
};

module.exports = {
  facebookLogin,
  facebookCallback,
};
