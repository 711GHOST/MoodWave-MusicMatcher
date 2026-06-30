// Recent search terms, persisted to localStorage (most-recent first, deduped).
const KEY = "mw_recent_searches";
const MAX = 8;

export const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const pushRecentSearch = (term) => {
  const t = (term || "").trim();
  if (!t) return getRecentSearches();
  const list = getRecentSearches().filter(
    (x) => x.toLowerCase() !== t.toLowerCase()
  );
  list.unshift(t);
  const trimmed = list.slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
  return trimmed;
};

export const clearRecentSearches = () => {
  localStorage.removeItem(KEY);
};
