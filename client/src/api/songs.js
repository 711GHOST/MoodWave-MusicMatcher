import { api } from "./client";

export const getAllSongs = () => api.get("/song/get/allsongs");
export const getMySongs = () => api.get("/song/get/mysongs");
export const getLikedSongs = () => api.get("/song/get/liked");
export const searchSongs = (query, page = 1, limit = 10) =>
  api.get(
    `/song/get/songname/${encodeURIComponent(query)}?page=${page}&limit=${limit}`
  );
export const getSongsByArtist = (name) =>
  api.get(`/song/get/artist/${encodeURIComponent(name)}`);
export const createSong = (payload) => api.post("/song/create", payload);
export const toggleLike = (songId) => api.post(`/song/like/${songId}`);
export const deleteSong = (songId) => api.del(`/song/${songId}`);
