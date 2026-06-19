import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPortfolio, buyStock, sellStock } from "../api/portfolio";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import Navbar from "../components/Navbar";

const COLORS = ["#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#84cc16"];

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [activeChart, setActiveChart] = useState("pie");

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await getPortfolio();
      setPortfolio(res.data);
    } catch {
      setError("Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const totalInvested = portfolio.reduce((s, x) => s + x.investedValue, 0);
  const totalCurrent = portfolio.reduce((s, x) => s + x.currentValue, 0);
  const totalPnL = totalCurrent - totalInvested;
  const pnlPct = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

  const pieData = portfolio.map(s => ({ name: s.symbol, value: s.currentValue }));
  const lineData = portfolio.map(s => ({
    name: s.symbol,
    invested: parseFloat(s.investedValue.toFixed(2)),
    current: parseFloat(s.currentValue.toFixed(2)),
  }));

  const openModal = (type, symbol = "") => {
    setModal({ type, symbol, quantity: "", price: "" });
    setModalError("");
  };
  const closeModal = () => {
    setModal(null);
    setModalError("");
  };

  const handleTrade = async () => {
    if (!modal.symbol || !modal.quantity) {
      setModalError("Please fill in all fields.");
      return;
    }
    if (modal.type === "buy" && !modal.price) {
      setModalError("Please enter a buy price.");
      return;
    }
    setModalLoading(true);
    setModalError("");
    try {
      if (modal.type === "buy") {
        await buyStock({
          symbol: modal.symbol.toUpperCase(),
          quantity: Number(modal.quantity),
          price: Number(modal.price)
        });
      } else {
        await sellStock({
          symbol: modal.symbol.toUpperCase(),
          quantity: Number(modal.quantity)
        });
      }
      closeModal();
      fetchPortfolio();
    } catch (err) {
      setModalError(err.response?.data?.message || "Trade failed.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar activePage="portfolio" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Portfolio</h1>
            <p className="text-slate-400 text-sm mt-1">Track your investments in real time</p>
          </div>
          <button
            onClick={() => openModal("buy")}
            className="gradient-border-btn text-slate-950 text-sm font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 self-start sm:self-auto shadow-lg shadow-emerald-500/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Buy Stock
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-white">₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-white">₹{totalCurrent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Returns</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalPnL >= 0 ? "+" : ""}{pnlPct}%
            </p>
          </div>
        </div>

        {/* Charts */}
        {portfolio.length > 0 && (
          <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Portfolio Analytics</h2>
              <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
                {["pie", "line"].map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveChart(c)}
                    className={`text-xs px-3.5 py-2 rounded-lg font-medium transition ${
                      activeChart === c
                        ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/50"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {c === "pie" ? "Allocation" : "Invested vs Current"}
                  </button>
                ))}
              </div>
            </div>

            {activeChart === "pie" ? (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `₹${v.toFixed(2)}`}
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          color: "#f8fafc",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }}></div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400 truncate">{d.name}</p>
                        <p className="text-sm font-bold text-white">₹{d.value.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{((d.value / totalCurrent) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                      }}
                      formatter={v => `₹${v}`}
                    />
                    <Line type="monotone" dataKey="invested" stroke="#64748b" strokeWidth={2.5} dot={{ fill: "#64748b", r: 4 }} name="Invested" />
                    <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} name="Current" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Holdings Table & Grid */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800/80">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Current Holdings</h2>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm gap-3">
              <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading holdings...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-rose-400 text-sm">{error}</div>
          ) : portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <p className="text-sm">Your portfolio is currently empty.</p>
              <Link to="/markets" className="text-sm text-emerald-400 mt-2 font-medium hover:text-emerald-300 transition">Browse Markets →</Link>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/20">
                      <th className="text-left px-6 py-4">Symbol</th>
                      <th className="text-right px-6 py-4">Qty</th>
                      <th className="text-right px-6 py-4">Buy Price</th>
                      <th className="text-right px-6 py-4">Live Price</th>
                      <th className="text-right px-6 py-4">Current Value</th>
                      <th className="text-right px-6 py-4">P&L</th>
                      <th className="text-right px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {portfolio.map((stock) => (
                      <tr key={stock.symbol} className="hover:bg-slate-900/30 transition group">
                        <td className="px-6 py-4">
                          <Link to={`/stock/${stock.symbol}`} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800/80">
                              {stock.symbol.slice(0, 2)}
                            </div>
                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition">{stock.symbol}</span>
                          </Link>
                        </td>
                        <td className="text-right px-6 py-4 text-sm font-medium text-slate-300">{stock.quantity}</td>
                        <td className="text-right px-6 py-4 text-sm text-slate-400">₹{stock.buyPrice.toFixed(2)}</td>
                        <td className="text-right px-6 py-4 text-sm text-white">₹{stock.livePrice.toFixed(2)}</td>
                        <td className="text-right px-6 py-4 text-sm font-bold text-white">₹{stock.currentValue.toFixed(2)}</td>
                        <td className={`text-right px-6 py-4 text-sm font-bold ${stock.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {stock.profitLoss >= 0 ? "+" : ""}₹{stock.profitLoss.toFixed(2)}
                        </td>
                        <td className="text-right px-6 py-4">
                          <button
                            onClick={() => openModal("sell", stock.symbol)}
                            className="text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-400/40 bg-rose-500/5 hover:bg-rose-500/10 px-3.5 py-1.5 rounded-xl transition"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card Grid */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                {portfolio.map((stock) => (
                  <div key={stock.symbol} className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Link to={`/stock/${stock.symbol}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm font-bold text-white hover:text-emerald-400 transition">{stock.symbol}</span>
                      </Link>
                      <button
                        onClick={() => openModal("sell", stock.symbol)}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 rounded-lg transition"
                      >
                        Sell
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-800/40 pt-3">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Qty / Buy</p>
                        <p className="text-xs font-bold text-slate-300">{stock.quantity} @ ₹{stock.buyPrice.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Live Price</p>
                        <p className="text-xs font-bold text-white">₹{stock.livePrice.toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-slate-500">P&L</p>
                        <p className={`text-xs font-bold ${stock.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {stock.profitLoss >= 0 ? "+" : ""}₹{stock.profitLoss.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{modal.type === "buy" ? "Buy Stock" : "Sell Stock"}</h3>
              <button
                onClick={closeModal}
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
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Stock Symbol</label>
                <input
                  type="text"
                  value={modal.symbol}
                  onChange={e => setModal({ ...modal, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g. RELIANCE"
                  className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Quantity</label>
                <input
                  type="number"
                  value={modal.quantity}
                  onChange={e => setModal({ ...modal, quantity: e.target.value })}
                  placeholder="e.g. 5"
                  min="1"
                  className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                />
              </div>
              {modal.type === "buy" && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Buy Price per share (₹)</label>
                  <input
                    type="number"
                    value={modal.price}
                    onChange={e => setModal({ ...modal, price: e.target.value })}
                    placeholder="e.g. 2850.00"
                    min="0"
                    step="0.01"
                    className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 text-sm font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={modalLoading}
                className={`flex-1 text-sm font-bold py-3 rounded-xl transition ${
                  modal.type === "buy"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-emerald-950 disabled:text-emerald-700"
                    : "bg-rose-500 hover:bg-rose-400 text-white disabled:bg-rose-950 disabled:text-rose-700"
                }`}
              >
                {modalLoading ? "Processing..." : modal.type === "buy" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
