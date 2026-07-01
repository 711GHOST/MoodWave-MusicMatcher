const express = require("express");
const audioController = require("../controllers/audioController");

const router = express.Router();

// Public (the audio element loads this with crossOrigin=anonymous, no cookies).
router.get("/stream", audioController.stream);

module.exports = router;
