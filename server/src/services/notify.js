const env = require("../config/env");

// Never hit the network during tests.
const isTest = () => env.NODE_ENV === "test";

const otpEmailHtml = (code, purpose) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#1ed760;margin-bottom:4px">Moodwave</h2>
    <p style="color:#333">Your ${purpose} code is:</p>
    <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#111">${code}</p>
    <p style="color:#777;font-size:13px">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
  </div>`;

// Send a one-time passcode by email via Resend.
async function sendEmailOtp(to, code, purpose = "verification") {
  if (isTest()) return { delivered: false, skipped: true };
  if (!env.RESEND_API_KEY) return { delivered: false, error: "Email not configured" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [to],
        subject: "Your Moodwave code",
        html: otpEmailHtml(code, purpose),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.id) return { delivered: true, id: data.id };
    return { delivered: false, error: data.message || "Email send failed" };
  } catch (e) {
    return { delivered: false, error: e.message };
  }
}

// Send a one-time passcode by SMS via Twilio (scoped API-key auth).
async function sendSmsOtp(to, code) {
  if (isTest()) return { delivered: false, skipped: true };
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_API_KEY_SID || !env.TWILIO_FROM_NUMBER) {
    return { delivered: false, error: "SMS not configured" };
  }
  try {
    const auth = Buffer.from(
      `${env.TWILIO_API_KEY_SID}:${env.TWILIO_API_KEY_SECRET}`
    ).toString("base64");
    const body = new URLSearchParams({
      To: to,
      From: env.TWILIO_FROM_NUMBER,
      Body: `Your Moodwave code is ${code}. It expires in 10 minutes.`,
    });
    const r = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.sid) return { delivered: true, id: data.sid };
    return { delivered: false, error: data.message || "SMS send failed" };
  } catch (e) {
    return { delivered: false, error: e.message };
  }
}

module.exports = { sendEmailOtp, sendSmsOtp };
