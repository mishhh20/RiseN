import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getStockDetail, buyStock } from "../api/portfolio";
import Navbar from "../components/Navbar";

const Stat = ({ label, value }) => (
  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

export default function StockDetail() {
  const { symbol } = useParams();
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
    if (!quantity) {
      setBuyError("Enter quantity.");
      return;
    }
    setBuyLoading(true);
    setBuyError("");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar activePage="" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {/* Back */}
        <Link to="/markets" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition w-fit font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75-6.75M4.5 12l6.75 6.75" />
          </svg>
          Back to Markets
        </Link>

        {success && (
          <div className="fixed top-20 right-6 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-5 py-3.5 rounded-xl text-sm shadow-2xl z-50 flex items-center gap-2.5 backdrop-blur-md">
            <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 text-sm gap-3">
            <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading asset details...
          </div>
        ) : !stock ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-500">Asset not found.</div>
        ) : (
          <>
            {/* Header */}
            <div className="glass-panel rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-lg font-bold text-emerald-400 border border-slate-800">
                    {symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{symbol}</h1>
                    <p className="text-slate-400 text-sm mt-0.5">{stock.name}</p>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850 mt-1.5 inline-block">
                      NSE / PUBLIC
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModal(true);
                    setBuyError("");
                  }}
                  className="gradient-border-btn text-slate-950 font-bold px-6 py-3 rounded-xl transition text-sm self-start sm:self-auto shadow-lg shadow-emerald-500/10"
                >
                  Buy Stock
                </button>
              </div>

              <div className="mt-6 flex items-end gap-3.5">
                <p className="text-4xl font-extrabold text-white">₹{stock.price?.toFixed(2)}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg mb-1.5 border ${
                  stock.change >= 0
                    ? "text-emerald-400 bg-emerald-400/5 border-emerald-500/10"
                    : "text-rose-400 bg-rose-400/5 border-rose-500/10"
                }`}>
                  {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Previous Close: ₹{stock.prevClose?.toFixed(2)}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
              <Stat label="Open" value={`₹${stock.open?.toFixed(2)}`} />
              <Stat label="Day High" value={`₹${stock.high?.toFixed(2)}`} />
              <Stat label="Day Low" value={`₹${stock.low?.toFixed(2)}`} />
              <Stat label="Volume" value={stock.volume?.toLocaleString() || "N/A"} />
            </div>

            {/* About / Market Info */}
            <div className="glass-panel rounded-2xl p-6 shadow-lg">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-350 mb-4">Market Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
                <div className="flex justify-between py-3 border-b border-slate-800/80">
                  <span className="text-xs font-medium text-slate-500">Market Cap</span>
                  <span className="text-xs text-white font-bold">{stock.marketCap || "N/A"}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800/80">
                  <span className="text-xs font-medium text-slate-500">Prev Close</span>
                  <span className="text-xs text-white font-bold">₹{stock.prevClose?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800/80">
                  <span className="text-xs font-medium text-slate-500">Day High</span>
                  <span className="text-xs text-emerald-400 font-bold">₹{stock.high?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800/80">
                  <span className="text-xs font-medium text-slate-500">Day Low</span>
                  <span className="text-xs text-rose-400 font-bold">₹{stock.low?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Buy Modal */}
      {modal && stock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Buy {symbol}</h3>
                <p className="text-xs text-slate-500 mt-0.5">@ ₹{stock.price?.toFixed(2)} per share</p>
              </div>
              <button
                onClick={() => setModal(false)}
                className="text-slate-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition"
              >
                ×
              </button>
            </div>
            
            {buyError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-4 text-xs font-semibold">
                {buyError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 5"
                  min="1"
                  className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                />
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3.5">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Total Amount</span>
                  <span>{quantity || 0} × ₹{stock.price?.toFixed(2)}</span>
                </div>
                <p className="text-xl font-bold text-white">
                  ₹{quantity ? (stock.price * quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 text-sm font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={buyLoading}
                className="flex-1 text-sm font-bold py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-emerald-950 disabled:text-emerald-700 transition"
              >
                {buyLoading ? "Buying..." : "Confirm Buy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}