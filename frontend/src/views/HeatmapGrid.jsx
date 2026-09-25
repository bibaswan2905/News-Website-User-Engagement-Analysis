import React, { useEffect, useState } from 'react';
import { Grid3X3, Clock, Sparkles, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function HeatmapGrid() {
  const { filterParams, refreshKey } = useAnalytics();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.fetchHeatmap(filterParams)
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
          <span className="text-sm">Generating 24/7 engagement heatmaps...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6 text-rose-400">
        Error loading heatmap: {error}
      </div>
    );
  }

  const { heatmap = [], categoryDeviceMatrix = [] } = data || {};

  // Find max views in heatmap for normalized color intensity
  let maxCellViews = 1;
  heatmap.forEach(day => {
    day.hours.forEach(h => {
      if (h.views > maxCellViews) maxCellViews = h.views;
    });
  });

  const getHeatmapColor = (views) => {
    if (!views || views === 0) return 'bg-slate-950/80 border-slate-900';
    const ratio = views / maxCellViews;
    if (ratio < 0.2) return 'bg-sky-950/60 border-sky-900/40 text-sky-300';
    if (ratio < 0.4) return 'bg-sky-800/60 border-sky-700/50 text-white';
    if (ratio < 0.7) return 'bg-sky-600 border-sky-500 text-white font-bold';
    return 'bg-indigo-500 border-indigo-400 text-white font-black shadow-sm shadow-indigo-500/40';
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="p-6 space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Engagement Heatmap & Cross-Matrices</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Identify reader prime time, diurnal news cycles, and device engagement variations across beats.
        </p>
      </div>

      {/* 24/7 Hourly x Day-of-Week Heatmap */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-sky-400" />
              Hourly Readership Intensity (Day of Week vs Hour of Day)
            </h3>
            <p className="text-xs text-slate-400">
              Hover over any hour cell to inspect exact page views and average reading time
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Low</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800"></span>
              <span className="w-3.5 h-3.5 rounded bg-sky-950 border border-sky-900"></span>
              <span className="w-3.5 h-3.5 rounded bg-sky-800 border border-sky-700"></span>
              <span className="w-3.5 h-3.5 rounded bg-sky-600 border border-sky-500"></span>
              <span className="w-3.5 h-3.5 rounded bg-indigo-500 border border-indigo-400"></span>
            </div>
            <span>Peak</span>
          </div>
        </div>

        {/* Heatmap Grid Table */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[720px]">
            {/* Hour header */}
            <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 text-[10px] text-slate-400 font-mono text-center mb-1">
              <div></div>
              {hoursList.map(h => (
                <div key={h} className="truncate">
                  {h.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Day rows */}
            <div className="space-y-1">
              {heatmap.map(d => (
                <div key={d.day} className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 items-center">
                  <div className="text-xs font-semibold text-slate-300 text-right pr-2">
                    {d.day}
                  </div>
                  {d.hours.map(cell => (
                    <div
                      key={cell.hour}
                      onMouseEnter={() => setHoveredCell({ day: d.day, ...cell })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-7 rounded border flex items-center justify-center text-[10px] font-mono transition-all duration-150 cursor-pointer hover:scale-110 hover:z-10 ${getHeatmapColor(cell.views)}`}
                    >
                      {cell.views > 0 ? cell.views : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover inspector card */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between min-h-[46px]">
          {hoveredCell ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-sky-400">{hoveredCell.day} at {hoveredCell.hour}:00</span>
              <span>• Total Views: <strong className="text-white font-mono">{hoveredCell.views}</strong></span>
              <span>• Avg Dwell: <strong className="text-emerald-400 font-mono">{hoveredCell.avgTime}s</strong></span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Hover over any grid cell to view granular timestamp metrics</span>
          )}
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">24-Hour Cycle</span>
        </div>
      </div>

      {/* Category x Device Cross-Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Cross-Matrix: Category x Device Engagement</h3>
            <p className="text-xs text-slate-400">
              Comparative analysis of reading dwell time and scroll completion by platform
            </p>
          </div>
          <span className="text-xs text-indigo-400 font-mono">Cross-Tabulation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="py-2.5 px-3">Content Beat</th>
                <th className="py-2.5 px-3">Device Platform</th>
                <th className="py-2.5 px-3 text-right">Page Views</th>
                <th className="py-2.5 px-3 text-right">Avg Dwell Time</th>
                <th className="py-2.5 px-3 text-right">Avg Scroll %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categoryDeviceMatrix.map((cd, idx) => {
                const Icon = cd.device_type === 'desktop' ? Monitor : cd.device_type === 'mobile' ? Smartphone : Tablet;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {cd.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 capitalize text-slate-300">
                        <Icon className="w-3.5 h-3.5 text-sky-400" />
                        <span>{cd.device_type}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {cd.views}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                      {Math.round(cd.avg_time)}s
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {Math.round(cd.avg_scroll)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
