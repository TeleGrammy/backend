const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        accessToken,
        refreshToken,
      };

      return done(null, user);
    }
  )
);
