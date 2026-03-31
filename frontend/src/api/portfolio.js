import api from "./axiosInstance";

export const getPortfolio = () => api.get("/portfolio/value");
export const buyStock = (data) => api.post("/portfolio/buy", data);
export const sellStock = (data) => api.post("/portfolio/sell", data);
export const getMarketData = (symbol = "") =>
  api.get(`/portfolio/market${symbol ? `?symbol=${symbol}` : ""}`);
export const getStockDetail = (symbol) => api.get(`/portfolio/market/${symbol}`);
export const getTransactions = () => api.get("/portfolio/transactions");

// Watchlist
export const getWatchlist = () => api.get("/watchlist");
export const addToWatchlist = (data) => api.post("/watchlist", data);
export const removeFromWatchlist = (symbol) => api.delete(`/watchlist/${symbol}`);

// Alerts
export const getAlerts = () => api.get("/watchlist/alerts");
export const createAlert = (data) => api.post("/watchlist/alerts", data);
export const deleteAlert = (id) => api.delete(`/watchlist/alerts/${id}`);
export const checkAlerts = () => api.get("/watchlist/alerts/check");