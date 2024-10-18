const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        phone: profile.phone || null,
        profilePic:
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : null,
        accessToken,
        refreshToken,
      };

      return done(null, user);
    }
  )
);

module.exports = passport;
