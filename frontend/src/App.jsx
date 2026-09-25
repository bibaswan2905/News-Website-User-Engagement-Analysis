import React from 'react';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import FilterBar from './components/FilterBar.jsx';
import ArticleDetailModal from './components/ArticleDetailModal.jsx';
import ExportModal from './components/ExportModal.jsx';

import OverviewDashboard from './views/OverviewDashboard.jsx';
import ContentPerformance from './views/ContentPerformance.jsx';
import UserNavigationFlow from './views/UserNavigationFlow.jsx';
import HeatmapGrid from './views/HeatmapGrid.jsx';
import RecommendationsPanel from './views/RecommendationsPanel.jsx';
import LiveSimulator from './views/LiveSimulator.jsx';

function MainLayout() {
  const { activeTab, isSimulatorOpen } = useAnalytics();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500/20">
      {/* Top Header */}
      <Header />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Global Filter Bar */}
          <FilterBar />

          {/* Active View Router */}
          <div className="flex-1 pb-16">
            {activeTab === 'overview' && <OverviewDashboard />}
            {activeTab === 'content' && <ContentPerformance />}
            {activeTab === 'navigation' && <UserNavigationFlow />}
            {activeTab === 'heatmap' && <HeatmapGrid />}
            {activeTab === 'recommendations' && <RecommendationsPanel />}
            {activeTab === 'simulator' && <LiveSimulator />}
          </div>
        </main>
      </div>

      {/* Interactive Global Modals */}
      <ArticleDetailModal />
      <ExportModal />
      {isSimulatorOpen && <LiveSimulator />}
    </div>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <MainLayout />
    </AnalyticsProvider>
  );
}
