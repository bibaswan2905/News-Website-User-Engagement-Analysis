import React, { useEffect, useState } from 'react';
import { 
  X, 
  Clock, 
  BookOpen, 
  User, 
  Calendar, 
  BarChart2, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Sparkles 
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function ArticleDetailModal() {
  const { selectedArticleId, setSelectedArticleId } = useAnalytics();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedArticleId) return;
    setLoading(true);
    api.fetchArticleDetail(selectedArticleId)
      .then(res => {
        if (res.success) setData(res.data);
        else setError(res.error || 'Failed to load details');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedArticleId]);

  if (!selectedArticleId) return null;

  const article = data?.article;
  const stats = data?.stats;
  const devices = data?.deviceBreakdown || [];
  const traffic = data?.trafficBreakdown || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {article?.category || 'News'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {article?.publish_date ? new Date(article.publish_date).toLocaleDateString() : ''}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {article?.title || 'Article Performance Deep Dive'}
            </h2>
          </div>
          <button
            onClick={() => setSelectedArticleId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading article analytics...</div>
          ) : error ? (
            <div className="py-12 text-center text-rose-400">{error}</div>
          ) : (
            <>
              {/* Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Author</div>
                    <div className="font-semibold">{article?.author}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Read Time</div>
                    <div className="font-semibold">{article?.read_time_min} mins</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Length</div>
                    <div className="font-semibold">{article?.word_count} words</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <BarChart2 className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Article ID</div>
                    <div className="font-semibold">#{article?.id}</div>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Engagement KPIs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <div className="text-xs text-slate-400">Total Page Views</div>
                    <div className="text-xl font-bold text-sky-400 mt-1">
                      {stats?.totalViews?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <div className="text-xs text-slate-400">Avg. Dwell Time</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {stats?.avgTimeSpent || 0}s
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <div className="text-xs text-slate-400">Avg. Scroll Depth</div>
                    <div className="text-xl font-bold text-indigo-400 mt-1">
                      {stats?.avgScrollDepth || 0}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <div className="text-xs text-slate-400">Recommendation CTR</div>
                    <div className="text-xl font-bold text-purple-400 mt-1">
                      {stats?.ctr || 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Readership by Device
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {devices.map(d => {
                    const devIcon = d.device_type === 'desktop' ? Monitor : d.device_type === 'mobile' ? Smartphone : Tablet;
                    const Icon = devIcon;
                    return (
                      <div key={d.device_type} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 capitalize">
                          <Icon className="w-3.5 h-3.5 text-sky-400" />
                          <span>{d.device_type}</span>
                        </div>
                        <div className="text-lg font-bold text-white mt-1">
                          {d.views} <span className="text-xs text-slate-400 font-normal">views</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Avg: {Math.round(d.avg_time)}s
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editorial Recommendation for this story */}
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sky-300">Editorial Diagnostic Recommendation</div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {stats?.avgScrollDepth > 65
                      ? 'High reader retention across paragraphs. Consider producing a follow-up analysis or linking this story to related premium archives.'
                      : 'Notable drop-off before 50% scroll depth. Adding visual callouts, diagrams, or a bulleted "key takeaways" box near the top could improve completion.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={() => setSelectedArticleId(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
