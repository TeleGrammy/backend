const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const axios = require("axios");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if email is provided in profile object
      let {email} = profile._json;

      // If email is not provided, fetch email from GitHub API
      if (!email) {
        try {
          const emailResponse = await axios.get(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `token ${accessToken}`,
              },
            }
          );

          const primaryEmail = emailResponse.data.find(
            (emailObj) => emailObj.primary && emailObj.verified
          );
          if (primaryEmail) {
            email = primaryEmail.email;
          }
        } catch (error) {
          return done(error);
        }
      }

      const user = {
        id: profile.id,
        name: profile.displayName,
        email,
        phone: String(
          Math.random() * (99999999999 - 10000000001) + 10000000000
        ),
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
