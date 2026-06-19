import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ activePage }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Portfolio", path: "/dashboard", id: "portfolio" },
    { name: "Markets", path: "/markets", id: "markets" },
    { name: "History", path: "/transactions", id: "history" },
    { name: "Watchlist", path: "/watchlist", id: "watchlist" },
    { name: "Profile", path: "/profile", id: "profile" },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Rise<span className="text-emerald-400">N</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Action button / Burger */}
      <div className="flex items-center gap-3">
        {/* Desktop logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="hidden md:inline-flex text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition duration-200"
        >
          Logout
        </button>

        {/* Hamburger Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 md:hidden text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 glass-panel border-t border-slate-800/60 flex flex-col p-4 gap-2 md:hidden shadow-2xl animate-fade-in">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium p-3 rounded-xl transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="h-px bg-slate-800/80 my-2" />
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
              navigate("/login");
            }}
            className="text-left text-sm font-medium text-rose-400 hover:text-rose-300 p-3 hover:bg-rose-500/5 rounded-xl transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
