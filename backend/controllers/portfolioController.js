const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const axios = require("axios");

const nseHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/",
};

const indianStocks = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "WIPRO", name: "Wipro" },
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance" },
  { symbol: "TATAMOTORS", name: "Tata Motors" },
  { symbol: "ADANIENT", name: "Adani Enterprises" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
];

const fallbackPrices = {
  RELIANCE: { price: 2850.75, change: 1.2, high: 2875.00, low: 2820.50, volume: "4.2M", marketCap: "₹19,32,000Cr" },
  TCS: { price: 3920.40, change: -0.5, high: 3955.00, low: 3905.00, volume: "2.1M", marketCap: "₹14,18,000Cr" },
  INFY: { price: 1756.30, change: 0.8, high: 1770.00, low: 1745.00, volume: "3.5M", marketCap: "₹7,31,000Cr" },
  WIPRO: { price: 462.15, change: -1.1, high: 468.00, low: 458.00, volume: "5.8M", marketCap: "₹2,42,000Cr" },
  HDFCBANK: { price: 1678.90, change: 0.3, high: 1685.00, low: 1668.00, volume: "3.9M", marketCap: "₹12,76,000Cr" },
  ICICIBANK: { price: 1245.60, change: 1.5, high: 1258.00, low: 1238.00, volume: "6.1M", marketCap: "₹8,77,000Cr" },
  SBIN: { price: 812.30, change: 0.6, high: 820.00, low: 808.00, volume: "7.3M", marketCap: "₹7,25,000Cr" },
  HINDUNILVR: { price: 2340.00, change: 0.2, high: 2352.00, low: 2330.00, volume: "1.2M", marketCap: "₹5,49,000Cr" },
  BAJFINANCE: { price: 7120.50, change: -0.7, high: 7180.00, low: 7095.00, volume: "0.9M", marketCap: "₹4,30,000Cr" },
  TATAMOTORS: { price: 945.60, change: -0.3, high: 955.00, low: 940.00, volume: "5.1M", marketCap: "₹3,48,000Cr" },
  ADANIENT: { price: 2456.75, change: 2.1, high: 2480.00, low: 2430.00, volume: "2.8M", marketCap: "₹2,80,000Cr" },
  SUNPHARMA: { price: 1678.45, change: 0.9, high: 1690.00, low: 1665.00, volume: "1.9M", marketCap: "₹4,02,000Cr" },
};

const fetchNSEQuote = async (symbol) => {
  try {
    const res = await axios.get(
      `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`,
      { headers: nseHeaders, timeout: 5000 }
    );
    const pd = res.data.priceInfo;
    return {
      symbol,
      name: indianStocks.find(s => s.symbol === symbol)?.name || symbol,
      price: pd.lastPrice,
      change: pd.pChange,
      high: pd.intraDayHighLow?.max || pd.lastPrice,
      low: pd.intraDayHighLow?.min || pd.lastPrice,
      volume: res.data.marketDeptOrderBook?.tradeInfo?.totalTradedVolume
        ? (res.data.marketDeptOrderBook.tradeInfo.totalTradedVolume / 1000000).toFixed(1) + "M"
        : "N/A",
      marketCap: fallbackPrices[symbol]?.marketCap || "N/A",
      open: pd.open,
      prevClose: pd.previousClose,
    };
  } catch {
    const fb = fallbackPrices[symbol];
    return fb ? { symbol, name: indianStocks.find(s => s.symbol === symbol)?.name || symbol, ...fb } : null;
  }
};

// BUY STOCK
const buyStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const existing = await Portfolio.findOne({ user: req.user.id, symbol });
    if (existing) {
      const totalQty = existing.quantity + quantity;
      existing.price = ((existing.price * existing.quantity) + (price * quantity)) / totalQty;
      existing.quantity = totalQty;
      await existing.save();
    } else {
      await Portfolio.create({ user: req.user.id, symbol, quantity, price });
    }
    await Transaction.create({
      user: req.user.id, symbol, type: "buy", quantity, price, total: price * quantity,
    });
    res.json({ message: "Stock bought successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PORTFOLIO (raw)
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.id });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SELL STOCK
const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const stock = await Portfolio.findOne({ user: req.user.id, symbol });
    if (!stock) return res.status(400).json({ message: "Stock not found" });
    if (stock.quantity < quantity) return res.status(400).json({ message: "Not enough stock to sell" });
    await Transaction.create({
      user: req.user.id, symbol, type: "sell", quantity, price: stock.price, total: stock.price * quantity,
    });
    stock.quantity -= quantity;
    if (stock.quantity === 0) await stock.deleteOne();
    else await stock.save();
    res.json({ message: "Stock sold successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PORTFOLIO VALUE
const getPortfolioValue = async (req, res) => {
  try {
    console.log("getPortfolioValue called for user:", req.user.id);
    const portfolio = await Portfolio.find({ user: req.user.id });
    console.log("Portfolio found:", portfolio.length, "stocks");
    const result = await Promise.all(portfolio.map(async (stock) => {
      const quote = await fetchNSEQuote(stock.symbol);
      const livePrice = quote?.price || stock.price;
      return {
        symbol: stock.symbol,
        quantity: stock.quantity,
        buyPrice: stock.price,
        livePrice,
        currentValue: livePrice * stock.quantity,
        investedValue: stock.price * stock.quantity,
        profitLoss: (livePrice - stock.price) * stock.quantity,
      };
    }));
    console.log("Result:", result);
    res.json(result);
  } catch (error) {
    console.error("PORTFOLIO ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET TRANSACTIONS
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARKET DATA
const getMarketData = async (req, res) => {
  const { symbol } = req.query;
  const toFetch = symbol
    ? [{ symbol: symbol.toUpperCase(), name: symbol }]
    : indianStocks;
  const results = await Promise.all(toFetch.map(s => fetchNSEQuote(s.symbol)));
  res.json(results.filter(Boolean));
};

// STOCK DETAIL
const getStockDetail = async (req, res) => {
  const { symbol } = req.params;
  const quote = await fetchNSEQuote(symbol.toUpperCase());
  if (!quote) return res.status(404).json({ message: "Stock not found" });
  res.json(quote);
};

module.exports = {
  buyStock,
  getPortfolio,
  sellStock,
  getPortfolioValue,
  getTransactions,
  getMarketData,
  getStockDetail,
  fetchNSEQuote, 
};