const express = require("express");
const router = express.Router();

const { getStock } = require("../controllers/stockController");
const protect = require("../middleware/authMiddleware");

// protected route
router.get("/:symbol", protect, getStock);

module.exports = router;