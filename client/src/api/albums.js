import { api } from "./client";

export const getFeaturedAlbums = () => api.get("/album/get/featured");
export const getMyAlbums = () => api.get("/album/get/me");
export const getAlbumById = (id) => api.get(`/album/get/album/${id}`);
export const createAlbum = (payload) => api.post("/album/create", payload);
export const addSongToAlbum = (albumId, songId) =>
  api.post("/album/add/song", { albumId, songId });
export const removeSongFromAlbum = (albumId, songId) =>
  api.post("/album/remove/song", { albumId, songId });
export const deleteAlbum = (id) => api.del(`/album/${id}`);
