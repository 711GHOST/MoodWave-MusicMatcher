import { BASE_URL } from "../api/client";

// Route remote track URLs through our CORS-enabling proxy so the Web Audio graph
// (equalizer / normalization) can process them. Local/data/blob URLs pass through.
export const proxiedTrack = (url) => {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith(BASE_URL)) return url;
  return `${BASE_URL}/audio/stream?src=${encodeURIComponent(url)}`;
};
