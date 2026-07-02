# 🎵 Moodwave

Music that matches your mood. Moodwave is a full-stack music streaming app
(MERN) that recommends a playlist based on how you feel - detected in your
browser with a quick camera scan, or chosen manually.

```
moodwave/
├── client/   # React (CRA + Craco + Tailwind) front end
└── server/   # Express + Mongoose API
```

## Features

- 🔐 **Secure auth** - JWT (with expiry), hashed passwords (bcryptjs), input
  validation, helmet, CORS allow-list and auth rate-limiting.
- 🎚️ **Real player** - one persistent audio engine with a true queue:
  play / pause, **next / previous through the actual queue**, seek (click + drag),
  volume, shuffle and repeat, and auto-advance.
- 🙂 **Mood detection** - in-browser face-expression analysis (`face-api.js`)
  with a manual mood picker fallback; maps your emotion to a curated playlist.
- 📚 **Playlists & library** - browse, create, add/remove songs, like songs,
  upload your own tracks, and search.
- 🌍 **Language switcher** - searchable, persisted, and relabels the UI.
- 📱 **Responsive** - desktop sidebar plus a mobile hamburger drawer + bottom nav.

## What's completed so far

The project has already reached a strong MVP and feature-complete state for local development, including:

- Full authentication flow: sign-up, login, logout, forgot/reset password, and OTP verification.
- A polished music experience: real queue playback, seek, shuffle/repeat, sleep timer, now-playing panel, and keyboard shortcuts.
- Discovery and personalization: mood detection with a manual fallback, live search, recent searches, artist pages, and personalized library views.
- Content management: playlist creation, song upload, likes, collaboration, and premium/profile/settings flows.
- Payment and security hardening: Razorpay-backed premium checkout, secure cookie-based auth, rate limiting, and server-side verification for payments and audio streaming.

## Security highlights

Security work completed so far includes:

- JWTs issued as `httpOnly` cookies and validated server-side.
- Password hashing, input validation, Helmet, CORS allow-listing, and request throttling.
- OTP sending with cooldowns and real email/SMS delivery paths.
- Payment verification using server-side HMAC checks and masked card metadata.
- An SSRF-guarded audio proxy for safe remote streaming.

For the current security posture and next steps, see [SECURITY.md](SECURITY.md).

## Quick start

Requires **Node 18+**. No local MongoDB needed - the server boots a
self-contained in-memory database (seeded with sample songs and mood playlists)
when `MONGODB_URI` is empty.

```bash
# 1. Install everything
npm run install:all

# 2. Run both apps together (from the repo root)
npm run dev                  # server on :3001, client on :3000
```

Or run them in separate terminals:

```bash
cd server && npm run dev     # http://localhost:3001
cd client && npm start       # http://localhost:3000
```

### Demo account

```
email:    demo@moodwave.app
password: Demo@1234
```

## Configuration

`server/.env`

| var | meaning |
| --- | --- |
| `MONGODB_URI` | Leave empty for an in-memory DB; set to a MongoDB/Atlas URI for persistence. |
| `JWT_SECRET` | Signing secret (use a long random value in production). |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`. |
| `CLIENT_ORIGIN` | Allowed CORS origin (default `http://localhost:3000`). |
| `SEED_ON_START` | `true` to auto-seed a persistent DB on first start. |

`client/.env`

| var | meaning |
| --- | --- |
| `REACT_APP_API_URL` | Base URL of the API (default `http://localhost:3001`). |

## Tests

```bash
cd server && npm test        # Jest + supertest over an in-memory MongoDB
```

## Notes

- The first run downloads an in-memory `mongod` binary and the face-api model
  weights (from a CDN) - this needs an internet connection once.
- Rotate any real secrets before deploying.
