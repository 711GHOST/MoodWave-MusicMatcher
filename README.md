# 🎵 Moodwave - Music that matches your mood

Moodwave is a full-stack **MERN** music-streaming app that builds a playlist around
how you feel - detected right in your browser with a quick camera scan, or picked
by hand. It pairs a real, queue-driven audio player with mood-based discovery, a
full account system, real payments, whole-page internationalization, and a
hardened, production-deployed backend.

```
moodwave/
├── client/   # React (CRA + Craco + Tailwind) front end  → deployed on Vercel
└── server/   # Express + Mongoose REST API                → deployed on Render
             # MongoDB Atlas (data) · Cloudinary (media)
```

---

## ✨ Live demo

- **App:** [Frontend](https://moodwave-iota.vercel.app/)
- **API:** [Backend](https://moodwave-musicmatcher.onrender.com)

**Demo account**
```
email:    demo@moodwave.app
password: Demo@1234
```

> Hosted on free tiers, so the API may take ~50s to wake from idle on the first
> request (it spins back down after inactivity).

---

## 🚀 Features

**Mood-based discovery**
- In-browser facial-expression analysis with `face-api.js` (models self-hosted - works offline, no CDN).
- Manual mood picker fallback; each emotion maps to a curated playlist.

**Real audio player**
- One persistent audio engine with a **true queue** - next/previous walk the actual playlist.
- Play/pause, seek (click + drag), volume, mute, shuffle, repeat, and auto-advance.
- **Real Web-Audio DSP:** a 6-band equalizer and volume normalization (BiquadFilters + DynamicsCompressor) driven live from Settings.
- Sleep timer, keyboard shortcuts, desktop now-playing panel + full-screen mobile sheet, and a "Recently played" shelf.

**Library, content & social**
- Create playlists, upload your own tracks, like songs/playlists, add/remove songs, and manage playlist **collaborators**.
- Cover-image upload via Cloudinary (widget + URL fallback + live preview).
- A seeded featured catalog owned by a system account; personalized "your library" views.

**Search**
- Unified search across songs, playlists, and artists, with **live/debounced** results, recent-search history, artist pages, and infinite scroll + pagination.

**Accounts & profile**
- Sign-up, login (email *or* username), logout, and **forgot/reset password**.
- Editable profile with **email & phone verification via 6-digit OTP** (real delivery).
- Stats, premium badge, and a first-time welcome flow.

**Premium & payments**
- Real **Razorpay** checkout (test mode): region-based pricing, hosted checkout, and **server-side HMAC verification** to grant Premium; cancellable.
- Card-brand detection + Luhn, OCR card scan, and a UPI QR code in the custom UI.

**Internationalization**
- **Whole-page translation into 40+ languages** via a Google Website Translate integration driven from a curated, searchable language picker.
- Full **RTL** support (Arabic/Urdu/Hebrew flip the entire layout).

**Responsive & resilient**
- Desktop sidebar + mobile hamburger drawer and bottom nav.
- App-wide error boundary with a recoverable fallback; toasts, spinners, and empty states throughout.

---

## 🛠 Tech stack

| Layer | Tech |
| --- | --- |
| **Front end** | React 18, React Router 6, Tailwind CSS, CRACO, Web Audio API, `face-api.js`, `tesseract.js` (OCR), `qrcode` |
| **Back end** | Node.js, Express, Mongoose, Passport (JWT strategy), express-validator, express-rate-limit, Helmet, cookie-parser |
| **Data & media** | MongoDB Atlas, Cloudinary |
| **Integrations** | Razorpay (payments), Resend (email OTP), Twilio (SMS OTP) |
| **Testing** | Jest + supertest (API), React Testing Library (client) |
| **Hosting** | Vercel (client), Render (API), MongoDB Atlas (DB) |

---

## 🏗 Architecture & deployment

The three tiers deploy independently:

- **Client** - static CRA build on **Vercel**. Reads the API base URL from `REACT_APP_API_URL` (baked in at build time).
- **API** - long-running Express service on **Render**. Single-origin CORS allow-list pinned to the client URL.
- **Database** - **MongoDB Atlas**; media on **Cloudinary**.

**Cross-domain auth:** the JWT lives in an `httpOnly` cookie. In production the cookie is issued `SameSite=None; Secure` so it survives the client↔API cross-domain hop (both served over HTTPS); locally it stays `SameSite=Lax`. Express `trust proxy` is enabled in production so rate limiting keys off the real client IP behind Render's proxy.

See **[SECURITY.md](SECURITY.md)** for the full security posture.

---

## ⚡ Quick start (local)

Requires **Node 18+**. No local MongoDB needed - with `MONGODB_URI` empty the
server boots a self-contained in-memory database, seeded with sample songs and
mood playlists.

```bash
# 1. Install client + server + root deps
npm run install:all

# 2. Run both apps together from the repo root
npm run dev                  # API on :3001, client on :3000
```

Or in separate terminals:

```bash
cd server && npm run dev     # http://localhost:3001
cd client && npm start       # http://localhost:3000
```

Seed a **persistent** (Atlas) database once:

```bash
cd server && npm run seed        # wipes + recreates demo account + catalog
# npm run db:clean               # keep demo + system account, remove other users
```

---

## ⚙️ Configuration

**`server/.env`**

| var | meaning |
| --- | --- |
| `NODE_ENV` | `production` in prod (enables secure cookies + trust-proxy). |
| `PORT` | API port (host platforms like Render inject this automatically). |
| `MONGODB_URI` | Empty → in-memory DB; set to a MongoDB/Atlas URI for persistence. |
| `JWT_SECRET` | Signing secret (long random value). |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`. |
| `CLIENT_ORIGIN` | Allowed CORS origin (the client URL). |
| `SEED_ON_START` | `true` to auto-seed a persistent DB on first start. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay checkout (secret is server-only). |
| `RESEND_API_KEY` / `RESEND_FROM` | Email OTP delivery. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_API_KEY_SID` / `TWILIO_API_KEY_SECRET` / `TWILIO_FROM_NUMBER` | SMS OTP delivery. |

**`client/.env`**

| var | meaning |
| --- | --- |
| `REACT_APP_API_URL` | Base URL of the API (default `http://localhost:3001`). |
| `REACT_APP_CLOUDINARY_*` | Optional overrides for the Cloudinary cloud/preset. |

> `REACT_APP_*` values are baked in at build time - change one and rebuild the client.

---

## 🧪 Tests

```bash
npm run test:all       # backend (Jest + supertest) + frontend (React Testing Library)
# or individually:
cd server && npm test          # 42 API tests over an in-memory MongoDB
npm run test:client            # 21 client tests
```

**42 backend + 21 frontend tests** cover auth, player/queue, search, playlists,
payments, and utilities.

---

## 📝 Notes

- First local run downloads an in-memory `mongod` binary once (needs internet).
- Face-api model weights are self-hosted in `client/public/models` - the mood page works offline.
- Rotate all real secrets before deploying or sharing publicly (keys, DB URI, JWT secret).
