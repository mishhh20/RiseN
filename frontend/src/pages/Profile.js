import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updatePassword } from "../api/auth";
import Navbar from "../components/Navbar";

const StatCard = ({ label, value, sub }) => (
  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
    {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
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
    setPwError("");
    setPwSuccess("");
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setPwSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar activePage="profile" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile & Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 text-sm gap-3">
            <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading profile information...
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-slate-950 shadow-lg shadow-emerald-500/10">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{profile?.email}</p>
                  <p className="text-slate-600 text-xs mt-1.5 font-medium">Member since {memberSince}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-panel rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total Trades" value={profile?.stats?.totalTrades || 0} />
                <StatCard label="Holdings" value={profile?.stats?.holdings || 0} sub="active stocks" />
                <StatCard label="Buys" value={profile?.stats?.buyCount || 0} />
                <StatCard label="Sells" value={profile?.stats?.sellCount || 0} />
              </div>
              <div className="mt-4 bg-slate-900/40 border border-slate-900 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Capital Deployed</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ₹{profile?.stats?.totalInvested?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.278-.659 2.003-.659.725 0 1.45.22 2.003.659.27.215.39.523.364.847m-8.6 8.364l1.116-1.117" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="glass-panel rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-5">Change Password</h3>

              {pwError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-4 text-xs font-semibold">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {pwSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-950 disabled:text-emerald-700 text-slate-950 font-bold py-3 rounded-xl text-sm transition"
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="glass-panel rounded-2xl p-6 border-rose-500/20 shadow-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-400 mb-1">Danger Zone</h3>
              <p className="text-xs text-slate-500 mb-4">This will terminate your current session.</p>
              <button
                onClick={handleLogout}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold px-5 py-3 rounded-xl transition"
              >
                Sign out of RiseN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}