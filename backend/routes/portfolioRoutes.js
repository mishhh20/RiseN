const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  buyStock,
  getPortfolio,
  sellStock,
  getPortfolioValue,
  getTransactions,
  getMarketData,
  getStockDetail,
} = require("../controllers/portfolioController");

router.get("/market", protect, getMarketData);
router.get("/market/:symbol", protect, getStockDetail);
router.get("/value", protect, getPortfolioValue);
router.get("/transactions", protect, getTransactions);
router.post("/buy", protect, buyStock);
router.post("/sell", protect, sellStock);
router.get("/", protect, getPortfolio);

module.exports = router;