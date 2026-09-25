import React from 'react';
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  MousePointerClick, 
  Activity 
} from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function DeltaBadge({ delta, invertColor = false }) {
  if (delta === undefined || delta === null) return null;
  const isZero = delta === 0;
  // If invertColor is true (like bounce rate), a negative delta is good (green)
  const isPositive = invertColor ? delta <= 0 : delta >= 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isZero
          ? 'bg-slate-800 text-slate-400'
          : isPositive
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
      }`}
    >
      {delta > 0 ? (
        <TrendingUp className="w-3 h-3" />
      ) : delta < 0 ? (
        <TrendingDown className="w-3 h-3" />
      ) : null}
      <span>{delta > 0 ? `+${delta}` : delta}%</span>
    </span>
  );
}

export default function KPICards({ summary = {}, deltas = {} }) {
  const cards = [
    {
      id: 'views',
      title: 'Total Page Views',
      value: (summary.totalViews || 0).toLocaleString(),
      delta: deltas.totalViews,
      icon: Eye,
      color: 'sky',
      subtext: 'Articles & section landings'
    },
    {
      id: 'sessions',
      title: 'Total User Sessions',
      value: (summary.totalSessions || 0).toLocaleString(),
      delta: deltas.totalSessions,
      icon: Users,
      color: 'indigo',
      subtext: 'Across all devices'
    },
    {
      id: 'unique_visitors',
      title: 'Unique Readers',
      value: (summary.uniqueVisitors || 0).toLocaleString(),
      delta: deltas.uniqueVisitors,
      icon: Activity,
      color: 'cyan',
      subtext: 'Distinct monthly visitors'
    },
    {
      id: 'bounce_rate',
      title: 'Average Bounce Rate',
      value: `${summary.bounceRate || 0}%`,
      delta: deltas.bounceRate,
      invertColor: true,
      icon: Compass,
      color: 'rose',
      subtext: 'Single-page exits'
    },
    {
      id: 'avg_duration',
      title: 'Avg. Session Duration',
      value: formatDuration(summary.avgDuration || 0),
      delta: deltas.avgDuration,
      icon: Clock,
      color: 'emerald',
      subtext: `Avg time on page: ${formatDuration(summary.avgTimeOnPage || 0)}`
    },
    {
      id: 'recommendation_ctr',
      title: 'Recommendation CTR',
      value: `${summary.ctr || 0}%`,
      delta: deltas.ctr,
      icon: MousePointerClick,
      color: 'purple',
      subtext: 'Next-story click rate'
    }
  ];

  const colorStyles = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${colorStyles[card.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  {card.value}
                </span>
                <DeltaBadge delta={card.delta} invertColor={card.invertColor} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
