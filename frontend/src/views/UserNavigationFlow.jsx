import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  GitFork, 
  ArrowDown, 
  LogIn, 
  LogOut, 
  MousePointerClick, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function UserNavigationFlow() {
  const { filterParams, refreshKey } = useAnalytics();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.fetchUserNavigation(filterParams)
      .then(res => {
        if (isMounted && res.success) {
          setData(res.data);
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Mapping reader navigation paths & drop-offs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6 text-rose-400">
        Error loading navigation flow: {error}
      </div>
    );
  }

  const { funnel = [], topEntryPages = [], topExitPages = [], scrollMilestones = [] } = data || {};

  return (
    <div className="p-6 space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">User Navigation Flow & Drop-Off Analysis</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Visualize reader progression from initial landing through engagement, recommendation clicks, and departure points.
        </p>
      </div>

      {/* Interactive 4-Stage Navigation Funnel Cards */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Full User Journey Funnel</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {funnel[0]?.count?.toLocaleString()} Total Inbound Sessions
          </span>
        </div>

        {/* Funnel Pipeline Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {funnel.map((step, idx) => {
            const isLast = idx === funnel.length - 1;

            return (
              <div
                key={step.id}
                className="relative p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-sky-400">{step.name}</span>
                    <span className="font-mono text-slate-300 font-semibold">{step.conversionPct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-3">
                    {step.description}
                  </p>
                </div>

                <div>
                  <div className="text-xl font-black text-white font-mono">
                    {step.count.toLocaleString()} <span className="text-xs text-slate-400 font-normal">users</span>
                  </div>

                  {/* Progress fill */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden my-2">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${step.conversionPct}%` }}
                    ></div>
                  </div>

                  {/* Drop-off stat */}
                  {!isLast ? (
                    <div className="flex items-center justify-between text-[11px] text-rose-400 font-medium bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 mt-2">
                      <span className="flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" />
                        Drop-off:
                      </span>
                      <span>{step.dropOffPct}% (-{step.dropOffCount.toLocaleString()})</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>Retained Loyal Readers</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Depth Milestones Drop-Off Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Article Scroll Depth Retention Curve</h3>
            <p className="text-xs text-slate-400">
              Percentage of page readers reaching each vertical milestone in article bodies
            </p>
          </div>
          <span className="text-xs text-indigo-400 font-mono">Telemetry: Scroll Events</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scrollMilestones} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="milestone" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip 
                formatter={(val) => [`${val}% readers reached`, 'Retention']}
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="reachPct" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                dot={{ fill: '#38bdf8', r: 5 }} 
                activeDot={{ r: 7 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Entry vs Exit Pages Cross-Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Entry Pages */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <LogIn className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Top Entry Pages</h3>
            </div>
            <span className="text-[11px] text-slate-400">Arrival Points</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                  <th className="py-2">Landing URL</th>
                  <th className="py-2 text-right">Inbound Sessions</th>
                  <th className="py-2 text-right">Bounce Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topEntryPages.map(p => (
                  <tr key={p.page} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-mono text-slate-300 max-w-xs truncate">{p.page}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-200">
                      {p.entries.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.bounceRate > 55 ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                      }`}>
                        {p.bounceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Exit Pages */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <LogOut className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Top Exit Pages (Drop-Offs)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Departure Points</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                  <th className="py-2">Exit URL</th>
                  <th className="py-2 text-right">Departures</th>
                  <th className="py-2 text-right">Session Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topExitPages.map(p => (
                  <tr key={p.page} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-mono text-slate-300 max-w-xs truncate">{p.page}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-rose-400">
                      {p.exits.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-300">
                      {p.avgSessionDuration}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
