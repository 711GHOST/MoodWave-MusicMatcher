const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const songController = require("../controllers/songController");

const router = express.Router();

router.use(requireAuth);

router.post(
  "/create",
  [
    body("name").trim().notEmpty().withMessage("Song name is required"),
    body("thumbnail").trim().notEmpty().withMessage("Thumbnail is required"),
    body("track").trim().notEmpty().withMessage("Track URL is required"),
  ],
  validate,
  songController.create
);

router.get("/get/allsongs", songController.getAll);
router.get("/get/mysongs", songController.getMySongs);
router.get("/get/liked", songController.getLiked);
router.get("/get/artist/:artistId", songController.getByArtist);
router.get("/get/songname/:query", songController.search);

router.post("/like/:songId", songController.toggleLike);
router.delete("/:songId", songController.remove);

module.exports = router;
