const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");
const env = require("../config/env");

const router = express.Router();

// Tighter cap for code-sending endpoints (on top of the per-user cooldown).
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: { error: "Too many code requests. Please try again later." },
});

router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("userName")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [body("password").notEmpty().withMessage("Password is required")],
  validate,
  authController.login
);

router.post("/logout", authController.logout);

router.post(
  "/forgot-password",
  otpLimiter,
  [body("email").isEmail().withMessage("A valid email is required")],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("code")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("Enter the 6-digit code"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.resetPassword
);

router.get("/me", requireAuth, authController.me);

router.patch(
  "/me",
  requireAuth,
  [
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("A valid email is required"),
    body("phone")
      .optional({ checkFalsy: false })
      .trim()
      .custom((v) => v === "" || /^[+()\-\s\d]{7,20}$/.test(v))
      .withMessage("Enter a valid phone number"),
  ],
  validate,
  authController.updateMe
);

router.post(
  "/otp/send",
  requireAuth,
  otpLimiter,
  [
    body("channel")
      .isIn(["email", "phone"])
      .withMessage("Channel must be email or phone"),
  ],
  validate,
  authController.sendOtp
);

router.post(
  "/otp/verify",
  requireAuth,
  [
    body("channel")
      .isIn(["email", "phone"])
      .withMessage("Channel must be email or phone"),
    body("code")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("Enter the 6-digit code"),
  ],
  validate,
  authController.verifyOtp
);

router.post("/premium", requireAuth, authController.goPremium);

module.exports = router;
