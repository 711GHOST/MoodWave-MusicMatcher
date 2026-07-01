const express = require("express");
const { requireAuth } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.use(requireAuth);

router.get("/config", paymentController.getConfig);
router.post("/order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.post("/confirm-demo", paymentController.confirmDemo);
router.post("/cancel", paymentController.cancelSubscription);
router.delete("/saved-card", paymentController.removeSavedCard);

module.exports = router;
