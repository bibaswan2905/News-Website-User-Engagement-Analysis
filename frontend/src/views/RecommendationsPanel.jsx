import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Zap, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function RecommendationsPanel() {
  const { filterParams, refreshKey } = useAnalytics();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedActions, setCompletedActions] = useState({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.fetchRecommendations(filterParams)
      .then(res => {
        if (isMounted && res.success) {
          setRecommendations(res.data);
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

  const toggleCheck = (id) => {
    setCompletedActions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Synthesizing automated analytics recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6 text-rose-400">
        Error loading recommendations: {error}
      </div>
    );
  }

  const severityBadge = (severity) => {
    if (severity === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3 h-3" />
          High Priority
        </span>
      );
    }
    if (severity === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Zap className="w-3 h-3" />
          Medium Priority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
        <Info className="w-3 h-3" />
        Optimization
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            Automated Analytics Insights & Editorial Action Plan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule-based intelligence engine diagnosing friction points, retention leaks, and content opportunities.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-sky-400">
          {recommendations.length} Strategic Actions Generated
        </span>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isDone = completedActions[rec.id];

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {severityBadge(rec.severity)}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {rec.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    Target Impact: {rec.expectedImpact}
                  </div>
                  <button
                    onClick={() => toggleCheck(rec.id)}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title={isDone ? 'Mark as incomplete' : 'Mark as implemented'}
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Insight */}
              <h3 className={`text-base font-bold text-white mb-1.5 ${isDone ? 'line-through text-slate-400' : ''}`}>
                {rec.title}
              </h3>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-3">
                <strong className="text-sky-400 block mb-1">Observation & Telemetry Evidence:</strong>
                {rec.insight}
              </div>

              {/* Action Plan */}
              <div className="flex items-start gap-2.5 text-xs text-slate-200 bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl">
                <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-300 block mb-0.5">Recommended Remediation:</strong>
                  <span>{rec.action}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
