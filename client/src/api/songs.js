import { api } from "./client";

export const getAllSongs = () => api.get("/song/get/allsongs");
export const getMySongs = () => api.get("/song/get/mysongs");
export const getLikedSongs = () => api.get("/song/get/liked");
export const searchSongs = (query) =>
  api.get(`/song/get/songname/${encodeURIComponent(query)}`);
export const getSongsByArtist = (name) =>
  api.get(`/song/get/artist/${encodeURIComponent(name)}`);
export const createSong = (payload) => api.post("/song/create", payload);
export const toggleLike = (songId) => api.post(`/song/like/${songId}`);
export const deleteSong = (songId) => api.del(`/song/${songId}`);
