import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getWatchlist, addToWatchlist, removeFromWatchlist,
  getAlerts, createAlert, deleteAlert, checkAlerts
} from "../api/portfolio";
import Navbar from "../components/Navbar";

export default function Watchlist() {
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

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addSymbol.trim()) return;
    setAddLoading(true);
    setAddError("");
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
    if (!alertTarget) {
      setAlertError("Enter a target price.");
      return;
    }
    setAlertLoading(true);
    setAlertError("");
    try {
      await createAlert({ symbol: alertModal, targetPrice: Number(alertTarget), condition: alertCondition });
      setAlertModal(null);
      setAlertTarget("");
      setAlertCondition("above");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar activePage="watchlist" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Watchlist & Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor stocks and set price alerts</p>
        </div>

        {/* Triggered Alerts Banner */}
        {triggeredAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {triggeredAlerts.map((a, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-5 py-4 rounded-xl text-sm flex items-start gap-3 backdrop-blur-sm">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.04 9.04 0 01-1.857 0m-6.857 0a9.04 9.04 0 01-1.857 0m1.857 0a9 9 0 01-1.857 0m1.857 0a9 9 0 001.857 2.292m0 0a2.997 2.997 0 001.857 0M10 6h4M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>🔔 <strong>{a.symbol}</strong> is now {a.condition} ₹{a.targetPrice} — current price: ₹{a.currentPrice?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Watchlist */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-lg">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">My Watchlist</h2>

              {/* Add stock */}
              <form onSubmit={handleAdd} className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={addSymbol}
                  onChange={e => setAddSymbol(e.target.value)}
                  placeholder="Add symbol (e.g. RELIANCE)"
                  className="flex-1 glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={addLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-950 disabled:text-emerald-700 text-slate-950 text-sm font-bold px-4 py-2.5 rounded-xl transition shrink-0"
                >
                  {addLoading ? "..." : "+ Add"}
                </button>
              </form>
              {addError && <p className="text-rose-400 text-xs mb-4 font-semibold">{addError}</p>}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-sm gap-3">
                  <svg className="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing watchlist...
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  <p className="text-sm font-medium">No stocks in watchlist.</p>
                  <p className="text-xs text-slate-500 mt-1">Add a symbol above or browse the Markets page.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {watchlist.map(stock => (
                    <div key={stock.symbol} className="flex items-center justify-between bg-slate-900/40 border border-slate-900 rounded-xl px-4 py-3.5 group transition duration-200 hover:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <Link to={`/stock/${stock.symbol}`} className="text-sm font-bold text-white hover:text-emerald-400 transition">{stock.symbol}</Link>
                          <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px]">{stock.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">₹{stock.price?.toFixed(2)}</p>
                          <p className={`text-xs font-bold ${stock.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change || 0).toFixed(2)}%
                          </p>
                        </div>

                        {/* Actions: Always visible on mobile, nicely inline */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setAlertModal(stock.symbol); setAlertError(""); setAlertTarget(""); }}
                            className="text-xs font-bold text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/20 bg-slate-900/60 p-2 rounded-xl transition"
                            title="Set Alert"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.04 9.04 0 01-1.857 0m-6.857 0a9.04 9.04 0 01-1.857 0m1.857 0a9 9 0 01-1.857 0m1.857 0a9 9 0 001.857 2.292m0 0a2.997 2.997 0 001.857 0M10 6h4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemove(stock.symbol)}
                            className="text-xs font-bold text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 bg-slate-900/60 p-2 rounded-xl transition"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5 shadow-lg">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Active Alerts</h2>

              {alerts.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <svg className="w-10 h-10 mx-auto mb-2 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.04 9.04 0 01-1.857 0m-6.857 0a9.04 9.04 0 01-1.857 0m1.857 0a9 9 0 01-1.857 0m1.857 0a9 9 0 001.857 2.292m0 0a2.997 2.997 0 001.857 0" />
                  </svg>
                  <p className="text-xs font-medium">No active triggers.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Click the bell icon on a watchlist stock to create one.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alerts.map(alert => (
                    <div
                      key={alert._id}
                      className={`rounded-xl border px-4 py-3 flex.col flex items-center justify-between transition ${
                        alert.triggered
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-slate-900/40 border-slate-900 text-slate-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{alert.symbol}</span>
                          {alert.triggered && (
                            <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-lg">
                              Triggered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {alert.condition === "above" ? "↑ Above" : "↓ Below"} ₹{alert.targetPrice}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl transition"
                        title="Delete Alert"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Set Alert — {alertModal}</h3>
                <p className="text-xs text-slate-500 mt-0.5">We will flag when this threshold is crossed</p>
              </div>
              <button
                onClick={() => setAlertModal(null)}
                className="text-slate-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition"
              >
                ×
              </button>
            </div>

            {alertError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-4 text-xs font-semibold">
                {alertError}
              </div>
            )}

            <div className="space-y-4.5">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase">Trigger Condition</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-850">
                  {["above", "below"].map(c => (
                    <button
                      key={c}
                      onClick={() => setAlertCondition(c)}
                      className={`py-2 rounded-lg text-xs font-bold transition capitalize ${
                        alertCondition === c
                          ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/50"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {c === "above" ? "↑ Above" : "↓ Below"}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase">Target Price (₹)</label>
                <input
                  type="number"
                  value={alertTarget}
                  onChange={e => setAlertTarget(e.target.value)}
                  placeholder="e.g. 3000"
                  min="0"
                  step="0.01"
                  className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAlertModal(null)}
                className="flex-1 text-sm font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={alertLoading}
                className="flex-1 text-sm font-bold py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-emerald-950 disabled:text-emerald-700 transition"
              >
                {alertLoading ? "Setting..." : "Set Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}