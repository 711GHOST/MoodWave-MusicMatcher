# Security Policy

## Supported versions

The current development build is considered the active target for security review and hardening.

## What has been completed

Security improvements that are already in place include:

- Secure authentication with hashed passwords, JWT-based session handling, and `httpOnly` cookies.
- Server-side validation for auth, playlists, songs, payments, and search endpoints.
- Helmet, CORS allow-listing, and rate limiting to reduce abuse and common web vulnerabilities.
- Real OTP delivery for email and SMS with per-user cooldowns and IP-based throttling.
- Payment verification using Razorpay HMAC validation and storage of only masked card metadata.
- An SSRF-guarded audio streaming proxy for safe remote media access.

## Reporting a vulnerability

Please report security issues privately by emailing the maintainer directly. Do not open a public issue for suspected vulnerabilities.

Please include:

- A concise summary of the issue
- Steps to reproduce
- Potential impact
- Any suggested remediation

## Response expectations

- Reports will be reviewed as quickly as possible.
- Valid issues will be acknowledged and tracked privately.
- Fixes will be implemented with the appropriate follow-up communication.

## Operational notes

- Rotate secrets before deployment or sharing the repository publicly.
- Keep environment variables such as `JWT_SECRET`, Razorpay keys, Resend/Twilio credentials, and MongoDB connection strings out of source control.
- Prefer production-safe configuration and secure cookie settings when deploying to a public domain.
