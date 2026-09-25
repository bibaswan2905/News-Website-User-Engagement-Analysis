import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Compass, 
  Share2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import KPICards from '../components/KPICards.jsx';
import * as api from '../api/client.js';

const CATEGORY_COLORS = {
  Politics: '#ef4444',
  Tech: '#3b82f6',
  Entertainment: '#ec4899',
  Sports: '#10b981',
  Business: '#f59e0b',
  Science: '#8b5cf6'
};

const PIE_PALETTE = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb923c', '#34d399'];

export default function OverviewDashboard() {
  const { filterParams, refreshKey, setActiveTab } = useAnalytics();
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.fetchMetrics(filterParams)
      .then(res => {
        if (isMounted && res.success) {
          setMetricsData(res.data);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filterParams, refreshKey]);

  if (loading && !metricsData) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Calculating news engagement metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6">
        <p className="text-rose-400 font-semibold">Failed to load analytics: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-1.5 text-xs bg-rose-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, deltas, timeline = [], distributions = {} } = metricsData || {};
  const { devices = [], trafficSources = [], categoryDistribution = [] } = distributions;

  const totalDeviceCount = devices.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* 1. Key Performance Indicators */}
      <KPICards summary={summary} deltas={deltas} />

      {/* 2. Main Timeline: Page Views and Sessions Over Time */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Traffic Dynamics: Page Views & User Sessions
            </h3>
            <p className="text-xs text-slate-400">
              Readership volume and visitor arrival patterns over the selected window
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
              <span>Page Views</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
              <span>Sessions</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="label" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#38bdf8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#viewsGrad)" 
                name="Page Views"
              />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stroke="#818cf8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#sessionsGrad)" 
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Three-Column Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Readership Share */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white">Content Category Share</h4>
              <button 
                onClick={() => setActiveTab('content')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2">Distribution of views across news sections</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="views"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category] || PIE_PALETTE[index % PIE_PALETTE.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val} views`, name]}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800/80">
            {categoryDistribution.slice(0, 6).map((c, i) => (
              <div key={c.category} className="text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[c.category] || PIE_PALETTE[i] }}
                  ></span>
                  <span className="truncate">{c.category}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{c.views}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution & Bounce Rates */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Device Landscape</h4>
            <p className="text-xs text-slate-400 mb-4">Traffic proportions and friction points</p>
          </div>

          <div className="space-y-4">
            {devices.map(d => {
              const pct = Math.round((d.count / totalDeviceCount) * 100);
              const isMobile = d.device === 'mobile';
              const Icon = isMobile ? Smartphone : d.device === 'desktop' ? Monitor : Tablet;

              return (
                <div key={d.device} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      <Icon className="w-4 h-4 text-sky-400" />
                      <span>{d.name}</span>
                    </div>
                    <div className="text-slate-400 font-mono">
                      {d.count} sessions ({pct}%)
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${isMobile ? 'bg-indigo-500' : 'bg-sky-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Avg Duration: <strong className="text-slate-300 font-semibold">{d.avgDuration}s</strong></span>
                    <span className="flex items-center gap-1">
                      Bounce: 
                      <strong className={`font-semibold ${d.bounceRate > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {d.bounceRate}%
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mobile users exhibit a higher bounce rate. Check the Insights tab for remediations.</span>
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Acquisition Channels</h4>
            <p className="text-xs text-slate-400 mb-4">How readers land on news coverage</p>
          </div>

          <div className="space-y-3">
            {trafficSources.map((t, idx) => {
              const maxCount = trafficSources[0]?.count || 1;
              const barWidth = Math.round((t.count / maxCount) * 100);

              return (
                <div key={t.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 text-sky-400" />
                      {t.source}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{t.count} visits</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Organic search & social referrals drive 64% of entrance volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
