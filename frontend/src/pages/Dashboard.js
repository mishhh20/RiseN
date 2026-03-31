import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getPortfolio, buyStock, sellStock } from "../api/portfolio";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16"];

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => { fetchPortfolio(); }, []);

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

  const openModal = (type, symbol = "") => { setModal({ type, symbol, quantity: "", price: "" }); setModalError(""); };
  const closeModal = () => { setModal(null); setModalError(""); };

  const handleTrade = async () => {
    if (!modal.symbol || !modal.quantity) { setModalError("Please fill in all fields."); return; }
    if (modal.type === "buy" && !modal.price) { setModalError("Please enter a buy price."); return; }
    setModalLoading(true); setModalError("");
    try {
      if (modal.type === "buy") {
        await buyStock({ symbol: modal.symbol.toUpperCase(), quantity: Number(modal.quantity), price: Number(modal.price) });
      } else {
        await sellStock({ symbol: modal.symbol.toUpperCase(), quantity: Number(modal.quantity) });
      }
      closeModal(); fetchPortfolio();
    } catch (err) {
      setModalError(err.response?.data?.message || "Trade failed.");
    } finally {
      setModalLoading(false);
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
            <Link to="/dashboard" className="text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg">Portfolio</Link>
            <Link to="/markets" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Markets</Link>
            <Link to="/transactions" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">History</Link>
            <Link to="/watchlist" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Watchlist</Link>
            <Link to="/profile" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Profile</Link>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-1.5 rounded-lg transition">Logout</button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Portfolio</h1>
            <p className="text-gray-500 text-sm mt-1">Track your investments in real time</p>
          </div>
          <button onClick={() => openModal("buy")} className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Buy Stock
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Invested</p>
            <p className="text-xl font-semibold">₹{totalInvested.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Current Value</p>
            <p className="text-xl font-semibold">₹{totalCurrent.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total P&L</p>
            <p className={`text-xl font-semibold ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Returns</p>
            <p className={`text-xl font-semibold ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}{pnlPct}%
            </p>
          </div>
        </div>

        {/* Charts */}
        {portfolio.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-gray-300">Portfolio Analytics</h2>
              <div className="flex gap-2">
                {["pie", "line"].map(c => (
                  <button key={c} onClick={() => setActiveChart(c)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition ${activeChart === c ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white border border-gray-700"}`}>
                    {c === "pie" ? "Allocation" : "Invested vs Current"}
                  </button>
                ))}
              </div>
            </div>

            {activeChart === "pie" ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                        <span className="text-sm text-gray-300">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">₹{d.value.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{((d.value / totalCurrent) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} formatter={v => `₹${v}`} />
                  <Line type="monotone" dataKey="invested" stroke="#6b7280" strokeWidth={2} dot={{ fill: "#6b7280", r: 4 }} name="Invested" />
                  <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} name="Current" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Holdings Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-medium text-gray-300">Holdings</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 text-sm">Loading portfolio...</div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-400 text-sm">{error}</div>
          ) : portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <p className="text-sm">No stocks yet.</p>
              <Link to="/markets" className="text-xs text-emerald-400 mt-2 hover:underline">Browse Markets →</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left px-6 py-3 font-medium">Symbol</th>
                  <th className="text-right px-6 py-3 font-medium">Qty</th>
                  <th className="text-right px-6 py-3 font-medium">Buy Price</th>
                  <th className="text-right px-6 py-3 font-medium">Live Price</th>
                  <th className="text-right px-6 py-3 font-medium">Current Value</th>
                  <th className="text-right px-6 py-3 font-medium">P&L</th>
                  <th className="text-right px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition group">
                    <td className="px-6 py-4">
                      <Link to={`/stock/${stock.symbol}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition">{stock.symbol}</span>
                      </Link>
                    </td>
                    <td className="text-right px-6 py-4 text-sm text-gray-300">{stock.quantity}</td>
                    <td className="text-right px-6 py-4 text-sm text-gray-300">₹{stock.buyPrice.toFixed(2)}</td>
                    <td className="text-right px-6 py-4 text-sm text-white">₹{stock.livePrice.toFixed(2)}</td>
                    <td className="text-right px-6 py-4 text-sm text-white">₹{stock.currentValue.toFixed(2)}</td>
                    <td className={`text-right px-6 py-4 text-sm font-medium ${stock.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stock.profitLoss >= 0 ? "+" : ""}₹{stock.profitLoss.toFixed(2)}
                    </td>
                    <td className="text-right px-6 py-4">
                      <button onClick={() => openModal("sell", stock.symbol)} className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-3 py-1 rounded-md transition">
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold">{modal.type === "buy" ? "Buy Stock" : "Sell Stock"}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition">×</button>
            </div>
            {modalError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{modalError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Stock Symbol</label>
                <input type="text" value={modal.symbol} onChange={e => setModal({ ...modal, symbol: e.target.value.toUpperCase() })} placeholder="e.g. RELIANCE"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Quantity</label>
                <input type="number" value={modal.quantity} onChange={e => setModal({ ...modal, quantity: e.target.value })} placeholder="e.g. 5" min="1"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition" />
              </div>
              {modal.type === "buy" && (
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Buy Price per share (₹)</label>
                  <input type="number" value={modal.price} onChange={e => setModal({ ...modal, price: e.target.value })} placeholder="e.g. 2850.00" min="0" step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 py-2.5 rounded-lg transition">Cancel</button>
              <button onClick={handleTrade} disabled={modalLoading}
                className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition ${modal.type === "buy" ? "bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-emerald-900" : "bg-red-500 hover:bg-red-400 text-white disabled:bg-red-900"}`}>
                {modalLoading ? "Processing..." : modal.type === "buy" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
