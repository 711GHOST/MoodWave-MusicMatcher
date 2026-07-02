const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const albumController = require("../controllers/albumController");
const { ALBUM_KINDS } = require("../models/Album");

const router = express.Router();

router.use(requireAuth);

router.post(
  "/create",
  [
    body("title").trim().notEmpty().withMessage("Album title is required"),
    body("artist")
      .trim()
      .notEmpty()
      .withMessage("Singer / band / group / movie name is required"),
    body("thumbnail").trim().notEmpty().withMessage("Cover image is required"),
    body("kind").optional().isIn(ALBUM_KINDS).withMessage("Unknown album kind"),
    body("songs").optional().isArray().withMessage("Songs must be a list"),
  ],
  validate,
  albumController.create
);

router.get("/get/featured", albumController.getFeatured);
router.get("/get/me", albumController.getMine);
router.get("/get/album/:albumId", albumController.getById);

router.post("/add/song", albumController.addSong);
router.post("/remove/song", albumController.removeSong);
router.delete("/:albumId", albumController.remove);

module.exports = router;
