const { validationResult } = require("express-validator");

// Runs after express-validator rules; returns the first error message.
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ error: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};
