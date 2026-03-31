const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getAlerts,
  createAlert,
  deleteAlert,
  checkAlerts,
} = require("../controllers/watchlistController");

router.get("/", protect, getWatchlist);
router.post("/", protect, addToWatchlist);
router.delete("/:symbol", protect, removeFromWatchlist);
router.get("/alerts", protect, getAlerts);
router.post("/alerts", protect, createAlert);
router.delete("/alerts/:id", protect, deleteAlert);
router.get("/alerts/check", protect, checkAlerts);

module.exports = router;