import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  GitFork, 
  Grid3X3, 
  Sparkles, 
  Radio, 
  RotateCcw,
  BarChart3
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function Sidebar() {
  const { activeTab, setActiveTab, refreshData } = useAnalytics();

  const handleResetData = async () => {
    if (window.confirm('Reset dataset to original baseline? All simulated visits will be cleared.')) {
      try {
        await api.resetData();
        refreshData();
        alert('Database restored to default baseline.');
      } catch (e) {
        alert('Failed to reset: ' + e.message);
      }
    }
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'content',
      label: 'Content Performance',
      icon: FileText,
      badge: '25 Stories'
    },
    {
      id: 'navigation',
      label: 'User Navigation & Funnel',
      icon: GitFork,
      badge: 'Drop-offs'
    },
    {
      id: 'heatmap',
      label: 'Heatmap & Matrices',
      icon: Grid3X3,
      badge: '24/7'
    },
    {
      id: 'recommendations',
      label: 'Insights & Actions',
      icon: Sparkles,
      badge: 'AI / Rules'
    },
    {
      id: 'simulator',
      label: 'Live Traffic Simulator',
      icon: Radio,
      badge: 'Real-time'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 dark:bg-slate-950/70 p-4 flex flex-col justify-between hidden lg:flex">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Analytics Navigation
        </div>

        <nav className="mt-2 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive 
                      ? 'bg-sky-500/20 text-sky-300' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Utility */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Journalism Analytics Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Multi-dimensional telemetry for newsrooms & digital publishers.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition"
          title="Reset database to fresh seed state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>
    </aside>
  );
}
