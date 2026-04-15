const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const User = require("../models/User");

const upsertOauthUser = async ({ provider, providerId, email, name, profile }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      authProvider: provider,
      isEmailVerified: true,
      oauthProviders: {
        googleId: provider === "google" ? providerId : null,
        githubId: provider === "github" ? providerId : null,
      },
      github: provider === "github" ? profile.username || "" : "",
    });
  }

  if (provider === "google" && !user.oauthProviders.googleId) {
    user.oauthProviders.googleId = providerId;
  }

  if (provider === "github" && !user.oauthProviders.githubId) {
    user.oauthProviders.githubId = providerId;
    if (!user.github && profile.username) user.github = profile.username;
  }

  if (!user.isEmailVerified) user.isEmailVerified = true;
  user.lastLoginAt = new Date();
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
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
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
          callbackURL: process.env.GITHUB_CALLBACK_URL,
          scope: ["user:email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const primaryEmail = profile.emails?.find((mail) => mail.verified)?.value || profile.emails?.[0]?.value;
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
