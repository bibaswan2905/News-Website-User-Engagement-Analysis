import React from 'react';
import { 
  Newspaper, 
  Sun, 
  Moon, 
  RefreshCw, 
  Download, 
  Radio, 
  Zap,
  Activity
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';

export default function Header() {
  const { 
    theme, 
    toggleTheme, 
    refreshData, 
    isLiveActive, 
    setIsLiveActive, 
    setIsExportModalOpen,
    setIsSimulatorOpen 
  } = useAnalytics();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 light:bg-white/80 light:border-slate-200 transition-colors">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              NewsPulse <span className="text-sky-500 font-extrabold text-sm px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">Analytics</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Live Feed Active
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 hidden md:block">
            News Website User Engagement & Drop-Off Analytics
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Live Traffic Simulator Button */}
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition shadow-sm"
          title="Simulate incoming reader traffic"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Traffic Simulator</span>
        </button>

        {/* Live Auto-Stream Toggle */}
        <button
          onClick={() => setIsLiveActive(!isLiveActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
            isLiveActive 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
          title={isLiveActive ? 'Streaming live user sessions' : 'Start live stream generator'}
        >
          <Radio className={`w-3.5 h-3.5 ${isLiveActive ? 'text-emerald-400 animate-pulse' : ''}`} />
          <span className="hidden sm:inline">{isLiveActive ? 'Streaming' : 'Stream OFF'}</span>
        </button>

        {/* Export Report */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          title="Export CSV / JSON Report"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Manual Refresh */}
        <button
          onClick={refreshData}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
}
