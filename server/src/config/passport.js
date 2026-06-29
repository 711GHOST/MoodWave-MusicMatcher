const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");
const env = require("./env");

// Prefer the httpOnly cookie (browser); fall back to a Bearer header
// (mobile/native clients, tests).
const cookieExtractor = (req) =>
  req && req.cookies ? req.cookies.token || null : null;

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      cookieExtractor,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        return user ? done(null, user) : done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
