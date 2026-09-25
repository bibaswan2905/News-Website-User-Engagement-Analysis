import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileJson, Check, Copy } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function ExportModal() {
  const { isExportModalOpen, setIsExportModalOpen, filterParams } = useAnalytics();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!isExportModalOpen) return null;

  const downloadCSV = async () => {
    setExporting(true);
    try {
      const res = await api.fetchContentPerformance(filterParams);
      if (!res.success) throw new Error('Failed to fetch data');

      const headers = ['ID', 'Title', 'Category', 'Author', 'Views', 'Sessions', 'Avg Time (s)', 'Avg Scroll (%)', 'CTR (%)', 'Engagement Score'];
      const rows = res.data.articles.map(a => [
        a.id,
        `"${a.title.replace(/"/g, '""')}"`,
        a.category,
        `"${a.author}"`,
        a.views,
        a.sessions,
        a.avgTimeSpent,
        a.avgScrollDepth,
        a.ctr,
        a.engagementScore
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `news_analytics_${filterParams.dateRange}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error generating CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadJSON = async () => {
    setExporting(true);
    try {
      const [metrics, content, nav, recs] = await Promise.all([
        api.fetchMetrics(filterParams),
        api.fetchContentPerformance(filterParams),
        api.fetchUserNavigation(filterParams),
        api.fetchRecommendations(filterParams)
      ]);

      const exportBundle = {
        exportedAt: new Date().toISOString(),
        filters: filterParams,
        metrics: metrics.data,
        contentPerformance: content.data,
        userNavigation: nav.data,
        recommendations: recs.data
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `news_analytics_full_report_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error generating JSON export: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">Export Analytics Report</h3>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-4 leading-relaxed">
          Export full engagement metrics, reading duration, navigation funnel, and automated recommendations for the current active filters:
        </p>

        <div className="my-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div>• Timeframe: <span className="text-white font-medium capitalize">{filterParams.dateRange}</span></div>
          <div>• Category: <span className="text-white font-medium capitalize">{filterParams.category}</span></div>
          <div>• Device: <span className="text-white font-medium capitalize">{filterParams.deviceType}</span></div>
        </div>

        <div className="space-y-2.5 mt-5">
          <button
            onClick={downloadCSV}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition font-medium text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Download Content Performance (CSV)</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-white font-mono">.csv</span>
          </button>

          <button
            onClick={downloadJSON}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition font-medium text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <FileJson className="w-4 h-4 text-sky-400" />
              <span>Full Analytics Bundle (JSON)</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-white font-mono">.json</span>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
