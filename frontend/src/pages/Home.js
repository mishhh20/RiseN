import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
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
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition duration-200">
            Sign In
          </Link>
          <Link to="/signup" className="gradient-border-btn text-slate-950 text-sm font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/10">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto py-16 sm:py-24 relative z-10 animate-fade-in">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full mb-6">
          Virtual Trading Platform
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Trade, track, and master the markets with <span className="gradient-text font-black">RiseN</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
          Experience real-time stock simulations, analyze portfolio growth, set custom threshold alerts, and backtest your strategies on our premium glassmorphic client interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/signup" className="gradient-border-btn text-slate-950 font-bold px-8 py-3.5 rounded-xl transition text-base shadow-lg shadow-emerald-500/10">
            Create Free Account
          </Link>
          <Link to="/login" className="text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 px-8 py-3.5 rounded-xl transition text-base font-semibold">
            Explore Dashboard
          </Link>
        </div>
      </section>

      {/* Feature section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Live Portfolio Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track allocation details, check real-time P&L changes, and visualize performance benchmarks instantly.
            </p>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Simulated Markets</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Trade popular stocks from major sectors using real-time mock data without putting capital at risk.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.04 9.04 0 01-1.857 0m-6.857 0a9.04 9.04 0 01-1.857 0m1.857 0a9 9 0 01-1.857 0m1.857 0a9 9 0 001.857 2.292m0 0a2.997 2.997 0 001.857 0" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Instant Threshold Alerts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Configure conditions to trigger price warnings, so you can lock in profits and protect investments.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-slate-600 text-xs relative z-10 mt-auto">
        <p>© {new Date().getFullYear()} RiseN Trading Platform. Built with React and Vanilla CSS glassmorphism.</p>
      </footer>
    </div>
  );
}
