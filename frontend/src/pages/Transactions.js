import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTransactions } from "../api/portfolio";

export default function Transactions() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
            <Link to="/transactions" className="text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg">History</Link>
            <Link to="/watchlist" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Watchlist</Link>
            <Link to="/profile" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Profile</Link>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-1.5 rounded-lg transition">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Transaction History</h1>
          <p className="text-gray-500 text-sm mt-1">All your buy and sell activity</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Transactions</p>
            <p className="text-2xl font-semibold">{transactions.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Invested</p>
            <p className="text-2xl font-semibold text-emerald-400">₹{totalBought.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Sold</p>
            <p className="text-2xl font-semibold text-red-400">₹{totalSold.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {["all", "buy", "sell"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-4 py-1.5 rounded-full border transition capitalize ${
                filter === f ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
              }`}>
              {f === "all" ? "All" : f === "buy" ? "Buys" : "Sells"}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <p className="text-sm">No transactions yet.</p>
              <Link to="/markets" className="text-xs text-emerald-400 mt-2 hover:underline">Browse stocks →</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left px-6 py-3 font-medium">Stock</th>
                  <th className="text-left px-6 py-3 font-medium">Type</th>
                  <th className="text-right px-6 py-3 font-medium">Qty</th>
                  <th className="text-right px-6 py-3 font-medium">Price</th>
                  <th className="text-right px-6 py-3 font-medium">Total</th>
                  <th className="text-right px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} className="border-b border-gray-800/40 hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <Link to={`/stock/${t.symbol}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {t.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition">{t.symbol}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        t.type === "buy" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right px-6 py-4 text-sm text-gray-300">{t.quantity}</td>
                    <td className="text-right px-6 py-4 text-sm text-gray-300">₹{t.price.toFixed(2)}</td>
                    <td className="text-right px-6 py-4 text-sm font-medium text-white">₹{t.total.toFixed(2)}</td>
                    <td className="text-right px-6 py-4 text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      <br />
                      <span className="text-gray-600">{new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}