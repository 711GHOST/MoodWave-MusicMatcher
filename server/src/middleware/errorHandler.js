const env = require("../config/env");

function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Duplicate key (unique index) - e.g. email/userName already taken.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(409)
      .json({ error: `An account with this ${field} already exists` });
  }
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors)[0];
    return res.status(422).json({ error: first.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const status = err.status || 500;
  if (env.NODE_ENV !== "test") console.error(err);
  res
    .status(status)
    .json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };
