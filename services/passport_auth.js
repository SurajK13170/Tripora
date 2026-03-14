const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db");
const jwtService = require("../utils/jwt");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;

        // check if user exists
        let user = await db.getOne(
          "SELECT * FROM users WHERE email=$1",
          [email]
        );

        if (!user) {
          await db.query(
            `INSERT INTO users (name,email,google_id,auth_type,is_email_verified)
             VALUES ($1,$2,$3,$4,$5)`,
            [name, email, googleId, "google", true]
          );

          user = await db.getOne(
            "SELECT * FROM users WHERE email=$1",
            [email]
          );
        }

        const token = jwtService.generateToken(user.id, user.email);

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


module.exports = passport;