const express = require("express");
const { requireAuth } = require("../middleware/auth");
const searchController = require("../controllers/searchController");

const router = express.Router();

router.use(requireAuth);

router.get("/:query", searchController.searchAll);

module.exports = router;
