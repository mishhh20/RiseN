import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getWatchlist, addToWatchlist, removeFromWatchlist,
  getAlerts, createAlert, deleteAlert, checkAlerts
} from "../api/portfolio";

export default function Watchlist() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add to watchlist
  const [addSymbol, setAddSymbol] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Create alert
  const [alertModal, setAlertModal] = useState(null);
  const [alertTarget, setAlertTarget] = useState("");
  const [alertCondition, setAlertCondition] = useState("above");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertError, setAlertError] = useState("");

  const fetchAll = async () => {
    try {
      const [wl, al, tr] = await Promise.all([
        getWatchlist(), getAlerts(), checkAlerts()
      ]);
      setWatchlist(wl.data);
      setAlerts(al.data);
      setTriggeredAlerts(tr.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addSymbol.trim()) return;
    setAddLoading(true); setAddError("");
    try {
      await addToWatchlist({ symbol: addSymbol.toUpperCase(), name: addSymbol.toUpperCase() });
      setAddSymbol("");
      fetchAll();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (symbol) => {
    await removeFromWatchlist(symbol);
    fetchAll();
  };

  const handleCreateAlert = async () => {
    if (!alertTarget) { setAlertError("Enter a target price."); return; }
    setAlertLoading(true); setAlertError("");
    try {
      await createAlert({ symbol: alertModal, targetPrice: Number(alertTarget), condition: alertCondition });
      setAlertModal(null); setAlertTarget(""); setAlertCondition("above");
      fetchAll();
    } catch (err) {
      setAlertError(err.response?.data?.message || "Failed to create alert.");
    } finally {
      setAlertLoading(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    await deleteAlert(id);
    fetchAll();
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
            <Link to="/watchlist" className="text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg">Watchlist</Link>
            <Link to="/profile" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Profile</Link>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-1.5 rounded-lg transition">Logout</button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Watchlist & Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor stocks and set price alerts</p>
        </div>

        {/* Triggered Alerts Banner */}
        {triggeredAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {triggeredAlerts.map((a, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-5 py-3 rounded-xl text-sm flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span>🔔 <strong>{a.symbol}</strong> is now {a.condition} ₹{a.targetPrice} — current price: ₹{a.currentPrice?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Watchlist */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">My Watchlist</h2>

              {/* Add stock */}
              <form onSubmit={handleAdd} className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={addSymbol}
                  onChange={e => setAddSymbol(e.target.value)}
                  placeholder="Add symbol e.g. RELIANCE"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition"
                />
                <button type="submit" disabled={addLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:bg-emerald-900">
                  {addLoading ? "..." : "+ Add"}
                </button>
              </form>
              {addError && <p className="text-red-400 text-xs mb-3">{addError}</p>}

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-sm">
                  <p>No stocks in watchlist.</p>
                  <p className="text-xs mt-1">Add a symbol above to start tracking.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {watchlist.map(stock => (
                    <div key={stock.symbol} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <Link to={`/stock/${stock.symbol}`} className="text-sm font-medium text-white hover:text-emerald-400 transition">{stock.symbol}</Link>
                          <p className="text-xs text-gray-500">{stock.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">₹{stock.price?.toFixed(2)}</p>
                          <p className={`text-xs font-medium ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change || 0).toFixed(2)}%
                          </p>
                        </div>
                        <button
                          onClick={() => { setAlertModal(stock.symbol); setAlertError(""); setAlertTarget(""); }}
                          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400 px-2.5 py-1 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                          + Alert
                        </button>
                        <button
                          onClick={() => handleRemove(stock.symbol)}
                          className="text-xs text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Price Alerts</h2>

              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <p>No alerts set.</p>
                  <p className="mt-1">Hover a stock and click + Alert</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert._id} className={`rounded-xl px-4 py-3 flex items-center justify-between ${alert.triggered ? "bg-amber-500/10 border border-amber-500/20" : "bg-gray-800/50"}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{alert.symbol}</span>
                          {alert.triggered && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Triggered</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {alert.condition === "above" ? "↑ Above" : "↓ Below"} ₹{alert.targetPrice}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteAlert(alert._id)} className="text-gray-600 hover:text-red-400 transition text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold">Set Alert — {alertModal}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Get notified when price is hit</p>
              </div>
              <button onClick={() => setAlertModal(null)} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition text-xl">×</button>
            </div>

            {alertError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{alertError}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {["above", "below"].map(c => (
                    <button key={c} onClick={() => setAlertCondition(c)}
                      className={`py-2 rounded-lg text-sm font-medium transition capitalize ${alertCondition === c ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                      {c === "above" ? "↑ Above" : "↓ Below"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Target Price (₹)</label>
                <input type="number" value={alertTarget} onChange={e => setAlertTarget(e.target.value)}
                  placeholder="e.g. 3000" min="0" step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setAlertModal(null)} className="flex-1 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 py-2.5 rounded-lg transition">Cancel</button>
              <button onClick={handleCreateAlert} disabled={alertLoading}
                className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-emerald-900 transition">
                {alertLoading ? "Setting..." : "Set Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}