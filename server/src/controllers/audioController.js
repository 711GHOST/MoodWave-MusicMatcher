const dns = require("dns").promises;
const { Readable } = require("stream");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

// Block SSRF to loopback / private / reserved address ranges.
const isBlockedIp = (ip) => {
  if (!ip) return true;
  if (ip === "::1" || ip === "::") return true;
  if (/^fe80:/i.test(ip) || /^fc/i.test(ip) || /^fd/i.test(ip)) return true;
  const v4 = ip.replace(/^::ffff:/i, "");
  const parts = v4.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 0 || a === 127) return true; // this-host / loopback
  if (a === 10) return true; // private
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
};

// Streams a remote audio file back to the browser with CORS headers so it can
// be processed by the Web Audio API (equalizer / normalization). Range requests
// are forwarded so seeking still works.
exports.stream = asyncHandler(async (req, res) => {
  const raw = req.query.src;
  if (!raw) return res.status(400).json({ error: "Missing src" });

  let url;
  try {
    url = new URL(raw);
  } catch {
    return res.status(400).json({ error: "Invalid src" });
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return res.status(400).json({ error: "Unsupported protocol" });
  }

  let address;
  try {
    address = (await dns.lookup(url.hostname)).address;
  } catch {
    return res.status(502).json({ error: "Host resolution failed" });
  }
  if (isBlockedIp(address)) {
    return res.status(403).json({ error: "Host not allowed" });
  }

  const fwd = {};
  if (req.headers.range) fwd.Range = req.headers.range;
  if (req.headers["if-range"]) fwd["If-Range"] = req.headers["if-range"];

  // Abort the upstream fetch if the browser disconnects mid-stream.
  const controller = new AbortController();
  res.on("close", () => controller.abort());

  let upstream;
  try {
    upstream = await fetch(url.href, {
      headers: fwd,
      redirect: "follow",
      signal: controller.signal,
    });
  } catch {
    if (!res.headersSent) res.status(502).json({ error: "Upstream fetch failed" });
    return undefined;
  }

  // CORS so the browser's Web Audio graph can read the samples.
  res.setHeader("Access-Control-Allow-Origin", env.CLIENT_ORIGIN);
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Accept-Ranges", "bytes");
  ["content-type", "content-length", "content-range", "cache-control", "last-modified", "etag"].forEach(
    (h) => {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    }
  );
  if (!upstream.headers.get("content-type")) {
    res.setHeader("Content-Type", "audio/mpeg");
  }

  res.status(upstream.status);
  if (!upstream.body) return res.end();

  // Pipe with error handling so a dropped connection can't crash the process.
  const nodeStream = Readable.fromWeb(upstream.body);
  nodeStream.on("error", () => {
    if (!res.destroyed) res.destroy();
  });
  res.on("error", () => nodeStream.destroy());
  nodeStream.pipe(res);
  return undefined;
});
