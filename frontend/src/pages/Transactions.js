import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransactions } from "../api/portfolio";
import Navbar from "../components/Navbar";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getTransactions()
      .then(res => setTransactions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);
  const totalBought = transactions.filter(t => t.type === "buy").reduce((s, t) => s + t.total, 0);
  const totalSold = transactions.filter(t => t.type === "sell").reduce((s, t) => s + t.total, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar activePage="history" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">All your buy and sell activity</p>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-emerald-400">
              ₹{totalBought.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Sold</p>
            <p className="text-2xl font-bold text-rose-400">
              ₹{totalSold.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 mb-6 w-fit">
          {["all", "buy", "sell"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === f
                  ? "bg-slate-850 text-emerald-400 shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f === "all" ? "All History" : f === "buy" ? "Purchases" : "Sales"}
            </button>
          ))}
        </div>

        {/* Transactions Table & List */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm gap-3">
              <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading transaction history...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-sm">No transaction records found.</p>
              <Link to="/markets" className="text-sm text-emerald-400 mt-2 font-semibold hover:text-emerald-300 transition">Explore Markets →</Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/20">
                      <th className="text-left px-6 py-4">Stock</th>
                      <th className="text-left px-6 py-4">Type</th>
                      <th className="text-right px-6 py-4">Qty</th>
                      <th className="text-right px-6 py-4">Execution Price</th>
                      <th className="text-right px-6 py-4">Total Amount</th>
                      <th className="text-right px-6 py-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filtered.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-900/30 transition group">
                        <td className="px-6 py-4">
                          <Link to={`/stock/${t.symbol}`} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800/80">
                              {t.symbol.slice(0, 2)}
                            </div>
                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition">{t.symbol}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                            t.type === "buy"
                              ? "text-emerald-400 bg-emerald-400/5 border-emerald-500/10"
                              : "text-rose-400 bg-rose-400/5 border-rose-500/10"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="text-right px-6 py-4 text-sm font-semibold text-slate-300">{t.quantity}</td>
                        <td className="text-right px-6 py-4 text-sm text-slate-400">₹{t.price.toFixed(2)}</td>
                        <td className="text-right px-6 py-4 text-sm font-bold text-white">₹{t.total.toFixed(2)}</td>
                        <td className="text-right px-6 py-4 text-xs font-medium text-slate-500">
                          <div className="text-slate-300">
                            {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                {filtered.map((t) => (
                  <div key={t._id} className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Link to={`/stock/${t.symbol}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-800">
                          {t.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm font-bold text-white hover:text-emerald-400 transition">{t.symbol}</span>
                      </Link>
                      
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                        t.type === "buy"
                          ? "text-emerald-400 bg-emerald-400/5 border-emerald-500/10"
                          : "text-rose-400 bg-rose-400/5 border-rose-500/10"
                      }`}>
                        {t.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-800/40 pt-3 text-left">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Qty / Price</p>
                        <p className="text-xs font-bold text-slate-300">{t.quantity} @ ₹{t.price.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Total Value</p>
                        <p className="text-xs font-bold text-white">₹{t.total.toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Date</p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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
    </div>
  );
}