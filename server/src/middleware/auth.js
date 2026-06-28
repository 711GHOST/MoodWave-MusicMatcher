const passport = require("passport");

// Stateless JWT guard for protected routes.
const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = { requireAuth };
