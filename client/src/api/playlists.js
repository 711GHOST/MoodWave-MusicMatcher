import { api } from "./client";

export const getMyPlaylists = () => api.get("/playlist/get/me");
export const getPlaylistById = (id) => api.get(`/playlist/get/playlist/${id}`);
export const getPlaylistByEmotion = (emotion) =>
  api.get(`/playlist/get/emotion/${encodeURIComponent(emotion)}`);
export const createPlaylist = (payload) =>
  api.post("/playlist/create", payload);
export const addSongToPlaylist = (playlistId, songId) =>
  api.post("/playlist/add/song", { playlistId, songId });
export const removeSongFromPlaylist = (playlistId, songId) =>
  api.post("/playlist/remove/song", { playlistId, songId });
export const deletePlaylist = (id) => api.del(`/playlist/${id}`);
