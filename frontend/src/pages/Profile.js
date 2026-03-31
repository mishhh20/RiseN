import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updatePassword } from "../api/auth";
<Link to="/watchlist" className="text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition">Watchlist</Link>
const StatCard = ({ label, value, sub }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
  </div>
);

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    getProfile()
      .then(res => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match."); return; }
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setPwLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setPwSuccess("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
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
            <Link to="/profile" className="text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg">Profile</Link>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-1.5 rounded-lg transition">
          Logout
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Profile & Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-gray-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* User Info Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold text-emerald-400">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{profile?.name}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
                  <p className="text-gray-600 text-xs mt-1">Member since {memberSince}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total Trades" value={profile?.stats?.totalTrades || 0} />
                <StatCard label="Holdings" value={profile?.stats?.holdings || 0} sub="active stocks" />
                <StatCard label="Buys" value={profile?.stats?.buyCount || 0} />
                <StatCard label="Sells" value={profile?.stats?.sellCount || 0} />
              </div>
              <div className="mt-4 bg-gray-800/50 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Capital Deployed</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ₹{profile?.stats?.totalInvested?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <svg className="w-8 h-8 text-emerald-500/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-5">Change Password</h3>

              {pwError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  {pwSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-emerald-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h3>
              <p className="text-xs text-gray-500 mb-4">This will end your current session.</p>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                Sign out of StockApp
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}