const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

require("./config/passport")(passport);

const app = express();

// In production the app runs behind a reverse proxy (Render), so the real
// client IP arrives in the X-Forwarded-For header. Trust the first proxy hop
// so req.ip and express-rate-limit key off the real client IP. Use 1 (first
// hop) rather than true (trust all), which would let clients spoof the header.
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(passport.initialize());

// Throttle auth endpoints to slow down brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: { error: "Too many attempts. Please try again later." },
});

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "moodwave-api" })
);

app.use("/auth", authLimiter, require("./routes/authRoutes"));
app.use("/song", require("./routes/songRoutes"));
app.use("/playlist", require("./routes/playlistRoutes"));
app.use("/album", require("./routes/albumRoutes"));
app.use("/search", require("./routes/searchRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));
app.use("/audio", require("./routes/audioRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
