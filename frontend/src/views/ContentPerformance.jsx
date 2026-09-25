import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Flame, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  MousePointerClick,
  Award
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';
import * as api from '../api/client.js';

export default function ContentPerformance() {
  const { filterParams, refreshKey, setSelectedArticleId } = useAnalytics();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('engagementScore');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.fetchContentPerformance(filterParams, sortBy, sortOrder)
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
  }, [filterParams, refreshKey, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const articles = data?.articles || [];
  const topPerformers = data?.topPerformers || [];
  const underPerformers = data?.underPerformers || [];
  const categoryStats = data?.categoryStats || [];

  // Local search and category filter
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCatFilter === 'all' || a.category === selectedCatFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCatFilter]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Analyzing news content engagement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6 text-rose-400">
        Error loading content performance: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Content Performance & Ranking</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluate article engagement metrics, dwell time, scroll completion, and composite scores across journalism beats.
        </p>
      </div>

      {/* Top 5 High Performers vs Top 5 Underperformers Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Performers */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Top 5 Engaging Articles</h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">High Loyalty</span>
          </div>

          <div className="space-y-2.5">
            {topPerformers.map((art, idx) => (
              <div 
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-sky-500/40 cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-slate-400 w-4">#{idx + 1}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 truncate">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-sky-400">{art.category}</span>
                      <span>•</span>
                      <span>{art.author}</span>
                      <span>•</span>
                      <span>{art.avgTimeSpent}s dwell</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">{art.engagementScore}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Score</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Underperformers */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Underperforming Content (Needs Attention)</h3>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">Review UX/Layout</span>
          </div>

          <div className="space-y-2.5">
            {underPerformers.map((art, idx) => (
              <div 
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-slate-400 w-4">#{idx + 1}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 truncate">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-amber-400">{art.category}</span>
                      <span>•</span>
                      <span>{art.views} views</span>
                      <span>•</span>
                      <span>{art.avgScrollDepth}% scroll</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400">{art.engagementScore}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Score</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance Bar Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Category Engagement Benchmark</h3>
            <p className="text-xs text-slate-400">Total Page Views vs. Average Dwell Time (seconds) by News Category</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#818cf8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="totalViews" name="Total Views" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avgTimeSpent" name="Avg Dwell Time (s)" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Master Articles Data Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Comprehensive Article Telemetry Table</h3>
            <p className="text-xs text-slate-400">
              Click any article row to open the granular telemetry inspector
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headline or author..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedCatFilter}
              onChange={(e) => setSelectedCatFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Politics">Politics</option>
              <option value="Tech">Tech</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Business">Business</option>
              <option value="Science">Science</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Article Headline & Author</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('views')}>
                  <div className="flex items-center gap-1">
                    <span>Views</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('avgTimeSpent')}>
                  <div className="flex items-center gap-1">
                    <span>Avg Dwell</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('avgScrollDepth')}>
                  <div className="flex items-center gap-1">
                    <span>Scroll %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('ctr')}>
                  <div className="flex items-center gap-1">
                    <span>Rec. CTR</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('engagementScore')}>
                  <div className="flex items-center gap-1">
                    <span>Score (0-100)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredArticles.map(art => {
                const isHigh = art.engagementScore >= 70;
                const isMid = art.engagementScore >= 45 && art.engagementScore < 70;

                return (
                  <tr
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-slate-200 hover:text-sky-400 truncate">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        By {art.author} • {art.readTimeMin}m read ({art.wordCount} words)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                      {art.views?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {art.avgTimeSpent}s
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300">{art.avgScrollDepth}%</span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="h-full bg-sky-500 rounded-full" 
                            style={{ width: `${art.avgScrollDepth}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-purple-400 font-semibold">
                      {art.ctr}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                        isHigh 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : isMid 
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' 
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {art.engagementScore}
                      </span>
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
