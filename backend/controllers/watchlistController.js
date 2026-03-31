const Watchlist = require("../models/Watchlist");
const Alert = require("../models/Alert");
const { fetchNSEQuote } = require("./portfolioController");

// GET WATCHLIST
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user.id });
    const result = await Promise.all(watchlist.map(async (item) => {
      const quote = await fetchNSEQuote(item.symbol);
      return {
        _id: item._id,
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: quote?.price || 0,
        change: quote?.change || 0,
        high: quote?.high || 0,
        low: quote?.low || 0,
      };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD TO WATCHLIST
const addToWatchlist = async (req, res) => {
  try {
    const { symbol, name } = req.body;
    const exists = await Watchlist.findOne({ user: req.user.id, symbol });
    if (exists) return res.status(400).json({ message: "Already in watchlist" });
    const item = await Watchlist.create({ user: req.user.id, symbol, name });
    res.json({ message: "Added to watchlist", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE FROM WATCHLIST
const removeFromWatchlist = async (req, res) => {
  try {
    await Watchlist.findOneAndDelete({ user: req.user.id, symbol: req.params.symbol });
    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALERTS
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE ALERT
const createAlert = async (req, res) => {
  try {
    const { symbol, targetPrice, condition } = req.body;
    const alert = await Alert.create({
      user: req.user.id, symbol, targetPrice, condition,
    });
    res.json({ message: "Alert created", alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ALERT
const deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHECK ALERTS (called when portfolio loads)
const checkAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id, triggered: false });
    const triggered = [];
    for (const alert of alerts) {
      const quote = await fetchNSEQuote(alert.symbol);
      if (!quote) continue;
      const hit = alert.condition === "above"
        ? quote.price >= alert.targetPrice
        : quote.price <= alert.targetPrice;
      if (hit) {
        alert.triggered = true;
        await alert.save();
        triggered.push({ symbol: alert.symbol, condition: alert.condition, targetPrice: alert.targetPrice, currentPrice: quote.price });
      }
    }
    res.json(triggered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, getAlerts, createAlert, deleteAlert, checkAlerts };