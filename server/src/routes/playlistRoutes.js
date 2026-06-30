const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const playlistController = require("../controllers/playlistController");

const router = express.Router();

router.use(requireAuth);

router.post(
  "/create",
  [
    body("name").trim().notEmpty().withMessage("Playlist name is required"),
    body("thumbnail").trim().notEmpty().withMessage("Thumbnail is required"),
  ],
  validate,
  playlistController.create
);

router.get("/get/featured", playlistController.getFeatured);
router.get("/get/me", playlistController.getMine);
router.get("/get/liked", playlistController.getLiked);
router.get("/get/playlist/:playlistId", playlistController.getById);
router.get("/get/artist/:artistId", playlistController.getByArtist);
router.get("/get/emotion/:emotion", playlistController.getByEmotion);

router.post("/like/:playlistId", playlistController.toggleLike);
router.post("/collaborators/add", playlistController.addCollaborator);
router.post("/collaborators/remove", playlistController.removeCollaborator);

// Kept for backward compatibility with the original POST-by-emotion contract.
router.post("/get/playlist-by-emotion", playlistController.getByEmotion);

router.post("/add/song", playlistController.addSong);
router.post("/remove/song", playlistController.removeSong);
router.delete("/:playlistId", playlistController.remove);

module.exports = router;
