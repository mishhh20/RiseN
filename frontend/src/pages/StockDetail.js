import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStockDetail, buyStock } from "../api/portfolio";

const Stat = ({ label, value }) => (
  <div className="bg-gray-800/50 rounded-xl p-4">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);
<Link to="/watchlist" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Watchlist</Link>
export default function StockDetail() {
  const { symbol } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getStockDetail(symbol)
      .then(res => setStock(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [symbol]);

  const handleBuy = async () => {
    if (!quantity) { setBuyError("Enter quantity."); return; }
    setBuyLoading(true); setBuyError("");
    try {
      await buyStock({ symbol, quantity: Number(quantity), price: stock.price });
      setModal(false);
      setQuantity("");
      setSuccess(`Bought ${quantity} shares of ${symbol}!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setBuyError(err.response?.data?.message || "Trade failed.");
    } finally {
      setBuyLoading(false);
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
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Portfolio</Link>
            <Link to="/markets" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Markets</Link>
            <Link to="/transactions" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">History</Link>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-1.5 rounded-lg transition">Logout</button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <Link to="/markets" className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Markets
        </Link>

        {success && (
          <div className="fixed top-20 right-6 bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm shadow-lg z-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading stock data...</p>
          </div>
        ) : !stock ? (
          <div className="text-center py-32 text-gray-500">Stock not found.</div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-lg font-bold text-emerald-400">
                    {symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{symbol}</h1>
                    <p className="text-gray-400 text-sm mt-0.5">{stock.name}</p>
                    <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">NSE</span>
                  </div>
                </div>
                <button
                  onClick={() => { setModal(true); setBuyError(""); }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm"
                >
                  Buy Stock
                </button>
              </div>

              <div className="mt-6 flex items-end gap-4">
                <p className="text-4xl font-bold">₹{stock.price?.toFixed(2)}</p>
                <span className={`text-sm font-medium px-3 py-1 rounded-lg mb-1 ${
                  stock.change >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                }`}>
                  {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Previous close: ₹{stock.prevClose?.toFixed(2)}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Stat label="Open" value={`₹${stock.open?.toFixed(2)}`} />
              <Stat label="Day High" value={`₹${stock.high?.toFixed(2)}`} />
              <Stat label="Day Low" value={`₹${stock.low?.toFixed(2)}`} />
              <Stat label="Volume" value={stock.volume || "N/A"} />
            </div>

            {/* About */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Market Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Market Cap</span>
                  <span className="text-xs text-white font-medium">{stock.marketCap || "N/A"}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Prev Close</span>
                  <span className="text-xs text-white font-medium">₹{stock.prevClose?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Day High</span>
                  <span className="text-xs text-emerald-400 font-medium">₹{stock.high?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Day Low</span>
                  <span className="text-xs text-red-400 font-medium">₹{stock.low?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Buy Modal */}
      {modal && stock && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold">Buy {symbol}</h3>
                <p className="text-xs text-gray-500 mt-0.5">@ ₹{stock.price?.toFixed(2)} per share</p>
              </div>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition text-xl">×</button>
            </div>
            {buyError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{buyError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 5" min="1"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition" />
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Total Amount</span>
                  <span>{quantity} × ₹{stock.price?.toFixed(2)}</span>
                </div>
                <p className="text-xl font-semibold">₹{quantity ? (stock.price * quantity).toFixed(2) : "0.00"}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 py-2.5 rounded-lg transition">Cancel</button>
              <button onClick={handleBuy} disabled={buyLoading} className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-emerald-900 transition">
                {buyLoading ? "Buying..." : "Confirm Buy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}