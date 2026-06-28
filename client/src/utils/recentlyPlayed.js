// Recently-played history, persisted to localStorage (most-recent first, deduped).
const KEY = "mw_recently_played";
const MAX = 20;
export const RECENTLY_PLAYED_EVENT = "mw:recently-played";

export const getRecentlyPlayed = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const pushRecentlyPlayed = (song) => {
  if (!song || !song._id) return;
  const slim = {
    _id: song._id,
    name: song.name,
    artist: song.artist,
    thumbnail: song.thumbnail,
    track: song.track,
  };
  const list = getRecentlyPlayed().filter((s) => s._id !== song._id);
  list.unshift(slim);
  const trimmed = list.slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
  // Let same-tab listeners (e.g. Home) refresh without a storage event.
  window.dispatchEvent(new CustomEvent(RECENTLY_PLAYED_EVENT));
  return trimmed;
};

export const clearRecentlyPlayed = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(RECENTLY_PLAYED_EVENT));
};
