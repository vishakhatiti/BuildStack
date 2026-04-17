const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const User = require("../models/User");

const extractPrimaryGitHubEmail = (profile) => {
  if (!profile.emails || profile.emails.length === 0) return null;
  const verifiedEmail = profile.emails.find((mail) => mail.verified)?.value;
  return verifiedEmail || profile.emails[0].value || null;
};

const upsertOauthUser = async ({ provider, providerId, email, name }) => {
  let user = await User.findOne({ provider, providerId });

  if (!user && email) {
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (!user) {
    user = new User({
      name,
      email: email.toLowerCase(),
      provider,
      providerId,
      isVerified: true,
    });
  } else {
    user.name = user.name || name;
    user.provider = provider;
    user.providerId = providerId;
    user.isVerified = true;
  }

  await user.save();
  return user;
};

const configurePassport = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("Google account missing email"));

            const user = await upsertOauthUser({
              provider: "google",
              providerId: profile.id,
              email,
              name: profile.displayName || email.split("@")[0],
            });

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback",
          scope: ["user:email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = extractPrimaryGitHubEmail(profile);
            if (!email) return done(new Error("GitHub account missing email"));

            const user = await upsertOauthUser({
              provider: "github",
              providerId: profile.id,
              email,
              name: profile.displayName || profile.username || email.split("@")[0],
            });

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
};

module.exports = configurePassport;
