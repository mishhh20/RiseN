import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getMarketData, buyStock, addToWatchlist } from "../api/portfolio";

const SECTORS = ["All", "Banking", "IT", "Energy", "FMCG", "Auto", "Pharma"];

const sectorMap = {
  RELIANCE: "Energy", TCS: "IT", INFY: "IT", WIPRO: "IT",
  HDFCBANK: "Banking", ICICIBANK: "Banking", SBIN: "Banking",
  HINDUNILVR: "FMCG", BAJFINANCE: "Banking",
  TATAMOTORS: "Auto", ADANIENT: "Energy", SUNPHARMA: "Pharma",
};

export default function Markets() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => { fetchMarket(); }, []);

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
    if (!modal.quantity || !modal.price) { setModalError("Please fill in all fields."); return; }
    setModalLoading(true); setModalError("");
    try {
      await buyStock({ symbol: modal.symbol, quantity: Number(modal.quantity), price: Number(modal.price) });
      setModal(null);
      setSuccessMsg(`Bought ${modal.quantity} shares of ${modal.symbol}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setModalError(err.response?.data?.message || "Trade failed.");
    } finally { setModalLoading(false); }
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
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <span className="text-lg font-semibold">StockApp</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Portfolio</Link>
            <Link to="/markets" className="text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg">Markets</Link>
            <Link to="/transactions" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">History</Link>
            <Link to="/watchlist" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Watchlist</Link>
            <Link to="/profile" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Profile</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks..."
              className="bg-gray-800 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-500 w-48 transition" />
            <svg className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-1.5 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {successMsg && (
          <div className="fixed top-20 right-6 bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm shadow-lg z-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            {successMsg}
          </div>
        )}

        {/* Top Gainers & Losers */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Top Gainers
              </p>
              <div className="space-y-2">
                {gainers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-800 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded">{s.symbol}</span>
                      <span className="text-xs text-gray-400 hidden sm:block">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white">₹{s.price.toFixed(2)}</span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+{s.change.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>Top Losers
              </p>
              <div className="space-y-2">
                {losers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-800 text-red-400 text-xs font-semibold px-2 py-0.5 rounded">{s.symbol}</span>
                      <span className="text-xs text-gray-400 hidden sm:block">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white">₹{s.price.toFixed(2)}</span>
                      <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded">{s.change.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {SECTORS.map(s => (
              <button key={s} onClick={() => setSector(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${sector === s ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="name">Sort: Name</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="gain">Best Performers</option>
            <option value="loss">Worst Performers</option>
          </select>
        </div>

        {/* Main Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">All Stocks</h2>
              <p className="text-xs text-gray-500 mt-0.5">{filtered.length} companies</p>
            </div>
            <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1 rounded-full">NSE / BSE · Prices in ₹</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading market data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <p className="text-sm">No stocks found for "{search}"</p>
              <button onClick={() => setSearch("")} className="text-xs text-emerald-400 mt-2 hover:underline">Clear search</button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left px-6 py-3 font-medium">Company</th>
                  <th className="text-left px-6 py-3 font-medium">Sector</th>
                  <th className="text-right px-6 py-3 font-medium">Price</th>
                  <th className="text-right px-6 py-3 font-medium">Change</th>
                  <th className="text-right px-6 py-3 font-medium">High</th>
                  <th className="text-right px-6 py-3 font-medium">Low</th>
                  <th className="text-right px-6 py-3 font-medium">Volume</th>
                  <th className="text-right px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-800/40 hover:bg-gray-800/40 transition group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <Link to={`/stock/${stock.symbol}`} className="text-sm font-medium text-white hover:text-emerald-400 transition">{stock.symbol}</Link>
                          <p className="text-xs text-gray-500">{stock.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{sectorMap[stock.symbol] || "Other"}</span>
                    </td>
                    <td className="text-right px-6 py-3.5">
                      <p className="text-sm font-medium text-white">₹{stock.price.toFixed(2)}</p>
                    </td>
                    <td className="text-right px-6 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${stock.change >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                        {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right px-6 py-3.5 text-xs text-gray-400">₹{stock.high.toFixed(2)}</td>
                    <td className="text-right px-6 py-3.5 text-xs text-gray-400">₹{stock.low.toFixed(2)}</td>
                    <td className="text-right px-6 py-3.5 text-xs text-gray-400">{stock.volume}</td>
                    <td className="text-right px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAddWatchlist(stock)}
                          className="text-xs text-gray-400 hover:text-amber-400 border border-gray-700 hover:border-amber-500/50 px-2.5 py-1 rounded-md transition opacity-0 group-hover:opacity-100">
                          ♡ Watch
                        </button>
                        <button
                          onClick={() => setModal({ symbol: stock.symbol, price: stock.price.toFixed(2), quantity: "" })}
                          className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-emerald-400">
                          Buy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold">Buy {modal.symbol}</h3>
                <p className="text-xs text-gray-500 mt-0.5">NSE / BSE</p>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition text-xl">×</button>
            </div>
            {modalError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{modalError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Price per share (₹)</label>
                <input type="number" value={modal.price} onChange={(e) => setModal({ ...modal, price: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Quantity</label>
                <input type="number" value={modal.quantity} onChange={(e) => setModal({ ...modal, quantity: e.target.value })}
                  placeholder="e.g. 5" min="1"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition" />
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Total Amount</span>
                  <span>{modal.quantity} shares × ₹{modal.price}</span>
                </div>
                <p className="text-xl font-semibold text-white">₹{modal.quantity ? (modal.price * modal.quantity).toFixed(2) : "0.00"}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 py-2.5 rounded-lg transition">Cancel</button>
              <button onClick={handleBuy} disabled={modalLoading}
                className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-emerald-900 transition">
                {modalLoading ? "Buying..." : "Confirm Buy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}