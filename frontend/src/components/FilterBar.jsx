import React from 'react';
import { Calendar, Filter, Smartphone, Monitor, Tablet, Layers } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';

export default function FilterBar() {
  const { 
    dateRange, 
    setDateRange, 
    category, 
    setCategory, 
    deviceType, 
    setDeviceType,
    activeTab,
    setActiveTab
  } = useAnalytics();

  const dateOptions = [
    { value: 'today', label: 'Today (Hourly)' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const categories = [
    'all',
    'Politics',
    'Tech',
    'Entertainment',
    'Sports',
    'Business',
    'Science'
  ];

  const devices = [
    { value: 'all', label: 'All Devices', icon: Layers },
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'mobile', label: 'Mobile', icon: Smartphone },
    { value: 'tablet', label: 'Tablet', icon: Tablet }
  ];

  const mobileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'content', label: 'Content' },
    { id: 'navigation', label: 'Funnel' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'recommendations', label: 'Actions' }
  ];

  return (
    <div className="bg-slate-900/40 border-b border-slate-800 px-6 py-3 space-y-2.5">
      {/* Mobile Nav Pills (visible only on small screens) */}
      <div className="flex lg:hidden overflow-x-auto gap-1 pb-1 scrollbar-none">
        {mobileTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === t.id
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 bg-slate-800/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Date Presets */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="px-2 text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Timeframe:</span>
          </span>
          {dateOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                dateRange === opt.value
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Right: Category & Device Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Categories</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Device Type Pills */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
            {devices.map(d => {
              const Icon = d.icon;
              const isSelected = deviceType === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setDeviceType(d.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={d.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters Shortcut */}
          {(category !== 'all' || deviceType !== 'all') && (
            <button
              onClick={() => {
                setCategory('all');
                setDeviceType('all');
              }}
              className="text-xs text-sky-400 hover:text-sky-300 underline font-medium px-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
