import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMarketData, buyStock, addToWatchlist } from "../api/portfolio";
import Navbar from "../components/Navbar";

const SECTORS = ["All", "Banking", "IT", "Energy", "FMCG", "Auto", "Pharma"];

const sectorMap = {
  RELIANCE: "Energy", TCS: "IT", INFY: "IT", WIPRO: "IT",
  HDFCBANK: "Banking", ICICIBANK: "Banking", SBIN: "Banking",
  HINDUNILVR: "FMCG", BAJFINANCE: "Banking",
  TATAMOTORS: "Auto", ADANIENT: "Energy", SUNPHARMA: "Pharma",
};

export default function Markets() {
  const [stocks, setStocks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const fetchMarket = async () => {
    try {
      setLoading(true);
      const res = await getMarketData();
      setStocks(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  useEffect(() => {
    let result = [...stocks];
    if (search.trim()) {
      result = result.filter(s =>
        s.symbol.includes(search.toUpperCase()) ||
        s.name.toUpperCase().includes(search.toUpperCase())
      );
    }
    if (sector !== "All") {
      result = result.filter(s => sectorMap[s.symbol] === sector);
    }
    if (sortBy === "price_high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "price_low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "gain") result.sort((a, b) => b.change - a.change);
    else if (sortBy === "loss") result.sort((a, b) => a.change - b.change);
    else result.sort((a, b) => a.name.localeCompare(b.name));
    setFiltered(result);
  }, [search, sector, sortBy, stocks]);

  const gainers = [...stocks].sort((a, b) => b.change - a.change).slice(0, 3);
  const losers = [...stocks].sort((a, b) => a.change - b.change).slice(0, 3);

  const handleBuy = async () => {
    if (!modal.quantity || !modal.price) {
      setModalError("Please fill in all fields.");
      return;
    }
    setModalLoading(true);
    setModalError("");
    try {
      await buyStock({
        symbol: modal.symbol,
        quantity: Number(modal.quantity),
        price: Number(modal.price)
      });
      setModal(null);
      setSuccessMsg(`Bought ${modal.quantity} shares of ${modal.symbol}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setModalError(err.response?.data?.message || "Trade failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddWatchlist = async (stock) => {
    try {
      await addToWatchlist({ symbol: stock.symbol, name: stock.name });
      setSuccessMsg(`${stock.symbol} added to watchlist!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setSuccessMsg(err.response?.data?.message || "Already in watchlist");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar activePage="markets" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        {successMsg && (
          <div className="fixed top-20 right-6 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-5 py-3.5 rounded-xl text-sm shadow-2xl z-50 flex items-center gap-2.5 backdrop-blur-md">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Search & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Markets</h1>
            <p className="text-slate-400 text-sm mt-1">Live market overview and listings</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks by symbol/name..."
              className="w-full glass-input text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500"
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Top Gainers & Losers */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Gainers */}
            <div className="glass-panel rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Top Gainers
              </p>
              <div className="space-y-3">
                {gainers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between p-2 hover:bg-slate-900/30 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                        {s.symbol}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline-block font-medium">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">₹{s.price.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-500/10 px-2 py-0.5 rounded-lg">
                        +{s.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="glass-panel rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block animate-pulse"></span>
                Top Losers
              </p>
              <div className="space-y-3">
                {losers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between p-2 hover:bg-slate-900/30 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <span className="bg-rose-500/10 text-rose-400 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-rose-500/10">
                        {s.symbol}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline-block font-medium">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">₹{s.price.toFixed(2)}</span>
                      <span className="text-xs font-bold text-rose-400 bg-rose-400/10 border border-rose-500/10 px-2 py-0.5 rounded-lg">
                        {s.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`text-xs font-medium px-4 py-2 rounded-xl transition border whitespace-nowrap ${
                  sector === s
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm"
                    : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-850 text-slate-300 text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="name">Sort: Alphabetical</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="gain">Change: High to Low</option>
            <option value="loss">Change: Low to High</option>
          </select>
        </div>

        {/* Main Stocks Listing */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">All Instruments</h2>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} listings match your filters</p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              NSE / BSE · INR (₹)
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm gap-3">
              <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading market feeds...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <p className="text-sm font-medium">No results matched your parameters.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setSector("All");
                }}
                className="text-xs text-emerald-400 mt-2 font-semibold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Stocks Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/20">
                      <th className="text-left px-6 py-4">Company</th>
                      <th className="text-left px-6 py-4">Sector</th>
                      <th className="text-right px-6 py-4">Live Price</th>
                      <th className="text-right px-6 py-4">24h Change</th>
                      <th className="text-right px-6 py-4">Session High</th>
                      <th className="text-right px-6 py-4">Session Low</th>
                      <th className="text-right px-6 py-4">Volume</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filtered.map((stock) => (
                      <tr key={stock.symbol} className="hover:bg-slate-900/30 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800/80">
                              {stock.symbol.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/stock/${stock.symbol}`}
                                className="text-sm font-bold text-white hover:text-emerald-400 transition"
                              >
                                {stock.symbol}
                              </Link>
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{stock.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            {sectorMap[stock.symbol] || "Other"}
                          </span>
                        </td>
                        <td className="text-right px-6 py-4 text-sm font-bold text-white">₹{stock.price.toFixed(2)}</td>
                        <td className="text-right px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            stock.change >= 0
                              ? "text-emerald-400 bg-emerald-400/5 border-emerald-500/10"
                              : "text-rose-400 bg-rose-400/5 border-rose-500/10"
                          }`}>
                            {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right px-6 py-4 text-xs font-medium text-slate-400">₹{stock.high.toFixed(2)}</td>
                        <td className="text-right px-6 py-4 text-xs font-medium text-slate-400">₹{stock.low.toFixed(2)}</td>
                        <td className="text-right px-6 py-4 text-xs font-medium text-slate-500">{stock.volume.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAddWatchlist(stock)}
                              className="text-xs font-bold text-slate-400 hover:text-amber-400 border border-slate-850 hover:border-amber-500/30 bg-slate-900/60 hover:bg-amber-500/5 px-3 py-2 rounded-xl transition md:opacity-0 group-hover:opacity-100"
                            >
                              + Watch
                            </button>
                            <button
                              onClick={() => setModal({ symbol: stock.symbol, price: stock.price.toFixed(2), quantity: "" })}
                              className="text-xs font-bold bg-emerald-500 text-slate-950 px-3.5 py-2 rounded-xl transition hover:bg-emerald-400 md:opacity-0 group-hover:opacity-100"
                            >
                              Buy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards Grid */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                {filtered.map((stock) => (
                  <div key={stock.symbol} className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 flex flex-col gap-3.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <Link to={`/stock/${stock.symbol}`} className="text-sm font-bold text-white hover:text-emerald-400 transition">
                            {stock.symbol}
                          </Link>
                          <p className="text-xs text-slate-500 truncate max-w-[140px]">{stock.name}</p>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        stock.change >= 0
                          ? "text-emerald-400 bg-emerald-400/5 border-emerald-500/10"
                          : "text-rose-400 bg-rose-400/5 border-rose-500/10"
                      }`}>
                        {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800/40 pt-3">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Live Price</p>
                        <p className="text-sm font-bold text-white">₹{stock.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAddWatchlist(stock)}
                          className="text-[11px] font-bold text-slate-400 border border-slate-800 bg-slate-900/40 px-3 py-1.5 rounded-lg transition"
                        >
                          + Watch
                        </button>
                        <button
                          onClick={() => setModal({ symbol: stock.symbol, price: stock.price.toFixed(2), quantity: "" })}
                          className="text-[11px] font-bold bg-emerald-500 text-slate-950 px-3.5 py-1.5 rounded-lg transition hover:bg-emerald-400"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Buy {modal.symbol}</h3>
                <p className="text-xs text-slate-500 mt-0.5">NSE / BSE</p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition"
              >
                ×
              </button>
            </div>
            
            {modalError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-4 text-xs">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Price per share (₹)</label>
                <input
                  type="number"
                  value={modal.price}
                  onChange={(e) => setModal({ ...modal, price: e.target.value })}
                  className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Quantity</label>
                <input
                  type="number"
                  value={modal.quantity}
                  onChange={(e) => setModal({ ...modal, quantity: e.target.value })}
                  placeholder="e.g. 5"
                  min="1"
                  className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                />
              </div>
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3.5">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Total Amount</span>
                  <span>{modal.quantity || 0} × ₹{modal.price}</span>
                </div>
                <p className="text-xl font-bold text-white">
                  ₹{modal.quantity ? (modal.price * modal.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 text-sm font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={modalLoading}
                className="flex-1 text-sm font-bold py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-emerald-950 disabled:text-emerald-700 transition"
              >
                {modalLoading ? "Buying..." : "Confirm Buy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}