const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "photos", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || "",
          phone: String(
            Math.random() * (99999999999 - 10000000001) + 10000000000
          ),
          profilePic: profile.photos?.[0]?.value || null,
          accessToken,
          refreshToken,
        };

        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
