# Security Policy

## Supported versions

Moodwave is deployed as a three-tier app (React client on Vercel, Express API on
Render, MongoDB Atlas). The current `main` build is the active target for security
review and hardening.

## Security measures in place

### Authentication & sessions
- Passwords hashed with **bcryptjs**; the password field is `select:false` so it is never returned by default.
- Stateless auth via **JWT** (7-day expiry), verified server-side with Passport's JWT strategy.
- The token is issued in an **`httpOnly` cookie** (not reachable from JavaScript - XSS-resistant). Passport reads the cookie first, falling back to an `Authorization: Bearer` header for non-browser clients.
- **Cross-domain hardening:** in production the cookie is `SameSite=None; Secure` (sent over the client↔API HTTPS hop); locally it stays `SameSite=Lax`. Logout clears the cookie with matching attributes.

### Transport & headers
- **Helmet** for secure HTTP response headers.
- **CORS allow-list** pinned to a single configured origin (`CLIENT_ORIGIN`) with credentials enabled.
- HTTPS enforced in production on both the client and API (required for `SameSite=None; Secure`).

### Input validation & abuse prevention
- Server-side **express-validator** on auth, playlist, song, payment, and search endpoints.
- **Rate limiting** (express-rate-limit) on auth routes to slow brute-force / credential stuffing.
- `trust proxy` is enabled in production so the limiter keys off the **real client IP** from `X-Forwarded-For` (set to the first hop only, so clients cannot spoof the header to bypass limits).

### One-time passcodes (OTP)
- Codes are **hashed (bcrypt)** at rest with a 10-minute expiry; a code is invalidated if the target email/phone changes before verification.
- Real delivery via **Resend** (email) and **Twilio** (SMS).
- Abuse controls: a **30s per-user resend cooldown** plus an **IP-based limiter** on code-sending routes.
- The code is **never echoed to real users** - the on-screen `devCode` hint is limited to the demo account (which can't receive real messages) and the test environment. In production it is always `undefined`.

### Payments
- Razorpay orders are created server-side and confirmed by **verifying the HMAC signature** before Premium is granted.
- Only **masked card metadata** is stored (brand, last 4, expiry, name) - never the full PAN or CVV.

### Media proxy
- The audio streaming proxy (`/audio/stream`) is **SSRF-guarded**: it blocks private/loopback/link-local addresses and permits only `http`/`https`, so it cannot be used to reach internal services.

### Secrets management
- All secrets (`JWT_SECRET`, MongoDB URI, Razorpay, Resend, Twilio, Cloudinary) live only in environment variables and are gitignored - never committed to source control.
- Secrets have been rotated ahead of public deployment.

## Reporting a vulnerability

Please report security issues **privately** by emailing the maintainer directly.
Do not open a public issue for suspected vulnerabilities.

Please include:

- A concise summary of the issue
- Steps to reproduce
- Potential impact
- Any suggested remediation

## Response expectations

- Reports will be reviewed as quickly as possible.
- Valid issues will be acknowledged and tracked privately.
- Fixes will be implemented with appropriate follow-up communication.

## Operational notes

- Rotate secrets before deployment or sharing the repository publicly.
- Keep `JWT_SECRET`, Razorpay keys, Resend/Twilio credentials, Cloudinary config, and the MongoDB connection string out of source control.
- Use production-safe configuration (`NODE_ENV=production`, secure cookies, HTTPS, single-origin CORS) on any public domain.

## Known limitations / non-goals

- Razorpay runs in **test mode**; the custom card / UPI / net-banking capture is a **simulated demo** (`/payment/confirm-demo`) because raw-PAN collection requires PCI-DSS / server-to-server. The hosted-checkout + HMAC-verify path is the genuine one.
- On free tiers, OTP delivery is restricted (Resend needs a verified domain to email arbitrary addresses; Twilio trial only texts verified numbers).
- In-memory rate limiting is per-instance; a multi-instance deployment should move it to a shared store (e.g. Redis).
