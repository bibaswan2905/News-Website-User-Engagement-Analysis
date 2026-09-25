import React, { useState } from 'react';
import { 
  Zap, 
  Radio, 
  Play, 
  CheckCircle, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Flame, 
  X,
  History
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext.jsx';

export default function LiveSimulator() {
  const { 
    isSimulatorOpen, 
    setIsSimulatorOpen, 
    triggerSimulation, 
    liveEvents, 
    isLiveActive, 
    setIsLiveActive 
  } = useAnalytics();

  const [category, setCategory] = useState('Tech');
  const [deviceType, setDeviceType] = useState('mobile');
  const [isEngaged, setIsEngaged] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);

  const handleSimulate = async () => {
    setIsSubmitting(true);
    setLastFeedback(null);
    try {
      const res = await triggerSimulation({ category, deviceType, isEngaged });
      setLastFeedback(`Simulated visit registered: "${res.event.article}" (${deviceType})`);
    } catch (e) {
      setLastFeedback('Simulation error: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBurst = async (count = 5) => {
    setIsSubmitting(true);
    const categories = ['Politics', 'Tech', 'Entertainment', 'Sports', 'Business', 'Science'];
    const devices = ['mobile', 'desktop', 'tablet'];
    for (let i = 0; i < count; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const dev = devices[Math.floor(Math.random() * devices.length)];
      await triggerSimulation({ category: cat, deviceType: dev, isEngaged: Math.random() > 0.3 });
    }
    setIsSubmitting(false);
    setLastFeedback(`Successfully generated ${count} randomized reader sessions`);
  };

  // Content rendering (used either as standalone tab or modal)
  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          Real-Time Traffic Simulator
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Inject live reader sessions into the SQLite database to verify dynamic dashboard responsiveness and metric calculation.
        </p>
      </div>

      {/* Simulator Control Board */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">
          Configure Simulated Visitor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">News Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="Politics">Politics</option>
              <option value="Tech">Tech</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Business">Business</option>
              <option value="Science">Science</option>
            </select>
          </div>

          {/* Device */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Device Platform</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          {/* Behavior */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reading Behavior</label>
            <select
              value={isEngaged ? 'engaged' : 'bounce'}
              onChange={(e) => setIsEngaged(e.target.value === 'engaged')}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="engaged">Engaged Multi-Article Reader</option>
              <option value="bounce">Quick Bounce (&lt;15s, 1 page)</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSimulate}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSubmitting ? 'Injecting Event...' : 'Send Single Visit'}</span>
          </button>

          <button
            onClick={() => handleBurst(5)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Generate 5-Visit Burst</span>
          </button>

          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition ${
              isLiveActive
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveActive ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>{isLiveActive ? 'Continuous Live Stream Active' : 'Start Continuous Stream'}</span>
          </button>
        </div>

        {lastFeedback && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{lastFeedback}</span>
          </div>
        )}
      </div>

      {/* Live Event Ticker Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Live Event Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {liveEvents.length} events logged
          </span>
        </div>

        {liveEvents.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No live events generated yet. Click "Send Single Visit" or "Generate 5-Visit Burst" above!
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {liveEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs animate-in slide-in-from-top-1"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-mono text-slate-400">{ev.timestamp}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {ev.category}
                  </span>
                  <span className="text-slate-200 font-medium truncate max-w-sm">
                    {ev.article}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px]">
                  <span className="capitalize text-slate-400">{ev.device}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    ev.isEngaged 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  }`}>
                    {ev.isEngaged ? 'Engaged' : 'Bounced'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // If used as modal
  if (isSimulatorOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // If rendered as view in activeTab
  return <div className="p-6">{content}</div>;
}
