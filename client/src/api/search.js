import { api } from "./client";

// Unified search -> { songs, playlists, artists }.
export const searchAll = (query) =>
  api.get(`/search/${encodeURIComponent(query)}`);
