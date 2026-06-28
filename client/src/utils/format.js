export const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? `0${s}` : s}`;
};

export const greetingKey = () => {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 18) return "goodAfternoon";
  return "goodEvening";
};

export const artistName = (artist) => {
  if (!artist) return "Unknown Artist";
  if (typeof artist === "string") return artist;
  return (
    [artist.firstName, artist.lastName].filter(Boolean).join(" ") ||
    "Unknown Artist"
  );
};

// Inline SVG placeholder so broken cover images degrade gracefully.
export const FALLBACK_COVER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#1d1d27"/><text x="50%" y="52%" font-size="120" fill="#4a4a57" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
  );

export const onImgError = (e) => {
  if (e.target.src !== FALLBACK_COVER) e.target.src = FALLBACK_COVER;
};
