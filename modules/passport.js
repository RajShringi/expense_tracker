const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var GitHubStrategy = require("passport-github").Strategy;
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        return done(err, false);
      }
      user.verifyPassword(password, (err, result) => {
        if (err) return done(err);
        if (!result) return done(null, false);
        done(null, user);
      });
    });
  })
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refereshToken, profile, done) => {
      const profileData = {
        name: profile.displayName,
        email: profile._json.email,
        isVerified: true,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(profileData, (err, addedUser) => {
            if (err) return done(err);
            return done(null, addedUser);
          });
        } else {
          return done(null, user);
        }
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "auth/google/callback",
    },
    (accessToken, refereshToken, profile, done) => {
      const profileData = {
        name: profile.displayName,
        email: profile._json.email,
        isVerified: true,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(profileData, (err, addedUser) => {
            if (err) return done(err);
            return done(null, addedUser);
          });
        } else {
          return done(null, user);
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
