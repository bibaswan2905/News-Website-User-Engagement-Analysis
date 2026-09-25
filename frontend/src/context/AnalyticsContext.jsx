import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as api from '../api/client.js';

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({ children }) {
  // Global Filters
  const [dateRange, setDateRange] = useState('30d');
  const [category, setCategory] = useState('all');
  const [deviceType, setDeviceType] = useState('all');

  // Navigation & View
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('analytics_theme') || 'dark';
  });

  // Modal states
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Live simulation & auto-refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveEvents, setLiveEvents] = useState([]);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('analytics_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshData = () => {
    setRefreshKey(k => k + 1);
  };

  const triggerSimulation = async (params = {}) => {
    try {
      const res = await api.simulateEvent(params);
      if (res.success && res.event) {
        setLiveEvents(prev => [
          {
            ...res.event,
            id: res.event.sessionId,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 19) // keep last 20 events
        ]);
        refreshData();
      }
      return res;
    } catch (err) {
      console.error('Simulation error:', err);
      throw err;
    }
  };

  // Live ticker auto-simulator if turned on
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      const categories = ['Politics', 'Tech', 'Entertainment', 'Sports', 'Business', 'Science'];
      const devices = ['mobile', 'desktop', 'tablet'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const dev = devices[Math.floor(Math.random() * devices.length)];
      const isEngaged = Math.random() > 0.35;
      triggerSimulation({ category: cat, deviceType: dev, isEngaged });
    }, 4500);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const filterParams = useMemo(() => ({
    dateRange,
    category,
    deviceType
  }), [dateRange, category, deviceType]);

  const value = {
    dateRange,
    setDateRange,
    category,
    setCategory,
    deviceType,
    setDeviceType,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    selectedArticleId,
    setSelectedArticleId,
    isExportModalOpen,
    setIsExportModalOpen,
    isSimulatorOpen,
    setIsSimulatorOpen,
    refreshKey,
    refreshData,
    liveEvents,
    isLiveActive,
    setIsLiveActive,
    triggerSimulation,
    filterParams
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export default AnalyticsContext;
