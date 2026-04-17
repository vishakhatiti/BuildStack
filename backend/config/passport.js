const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const User = require("../models/User");

const extractPrimaryGitHubEmail = (profile) => {
  if (!profile.emails || profile.emails.length === 0) return null;
  const verifiedEmail = profile.emails.find((mail) => mail.verified)?.value;
  return verifiedEmail || profile.emails[0].value || null;
};

const upsertOauthUser = async ({ provider, providerId, email, name, profile }) => {
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
      isEmailVerified: true,
      github: provider === "github" ? profile.username || "" : "",
      lastLoginAt: new Date(),
    });
  } else {
    user.name = user.name || name;
    user.provider = provider;
    user.providerId = providerId;
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();
    if (provider === "github" && !user.github && profile.username) {
      user.github = profile.username;
    }
  }

  await user.save();
  return user;
};

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

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
              profile,
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
            const primaryEmail = extractPrimaryGitHubEmail(profile);
            if (!primaryEmail) return done(new Error("GitHub account missing email"));

            const user = await upsertOauthUser({
              provider: "github",
              providerId: profile.id,
              email: primaryEmail,
              name: profile.displayName || profile.username,
              profile,
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
