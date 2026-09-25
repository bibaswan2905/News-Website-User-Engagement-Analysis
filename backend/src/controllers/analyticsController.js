import { queryAll, queryOne, runStmt, execSql } from '../db/database.js';
import metricsEngine from '../services/metricsEngine.js';
import navigationEngine from '../services/navigationEngine.js';
import recommendationEngine from '../services/recommendationEngine.js';
import { seedDatabase } from '../db/seed.js';

export function getMetrics(req, res) {
  try {
    const filters = {
      dateRange: req.query.dateRange || '30d',
      category: req.query.category || 'all',
      deviceType: req.query.deviceType || 'all'
    };

    const summary = metricsEngine.calculateSummaryMetrics(filters);
    const timeline = metricsEngine.getTimelineMetrics(filters);
    const distributions = metricsEngine.getDistributionMetrics(filters);

    res.json({
      success: true,
      data: {
        summary: summary.current,
        previous: summary.previous,
        deltas: summary.deltas,
        dateRange: summary.dateRange,
        rangeLabels: summary.rangeLabels,
        timeline,
        distributions
      }
    });
  } catch (error) {
    console.error('Error in getMetrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getContentPerformance(req, res) {
  try {
    const { dateRange = '30d', category = 'all', deviceType = 'all', sortBy = 'views', order = 'desc' } = req.query;
    const dates = metricsEngine.parseDateFilter(dateRange);

    let whereClause = `WHERE pv.timestamp >= ? AND pv.timestamp <= ?`;
    let params = [dates.currentStart, dates.currentEnd];

    if (deviceType !== 'all') {
      whereClause += ` AND s.device_type = ?`;
      params.push(deviceType);
    }
    if (category !== 'all') {
      whereClause += ` AND a.category = ?`;
      params.push(category);
    }

    // Article level engagement
    const articles = queryAll(`
      SELECT 
        a.id,
        a.slug,
        a.title,
        a.category,
        a.author,
        a.publish_date,
        a.read_time_min,
        a.word_count,
        COUNT(pv.view_id) AS views,
        COUNT(DISTINCT pv.session_id) AS sessions,
        AVG(pv.time_spent) AS avg_time_spent,
        AVG(pv.scroll_depth_pct) AS avg_scroll_depth,
        SUM(pv.clicked_recommendation) AS rec_clicks
      FROM articles a
      LEFT JOIN page_views pv ON a.id = pv.article_id
      LEFT JOIN user_sessions s ON pv.session_id = s.session_id
      ${whereClause}
      GROUP BY a.id
    `, params);

    // Calculate max views for normalization
    const maxViews = Math.max(...articles.map(a => a.views || 0), 1);

    const formattedArticles = articles.map(art => {
      const views = art.views || 0;
      const avgTime = Math.round(art.avg_time_spent || 0);
      const avgScroll = Math.round(art.avg_scroll_depth || 0);
      const recClicks = art.rec_clicks || 0;
      const ctr = views > 0 ? Number(((recClicks / views) * 100).toFixed(1)) : 0;
      
      // Calculate engagement score (0 to 100 scale)
      // 35% views weight, 30% time weight, 20% scroll weight, 15% ctr weight
      const targetTimeSec = (art.read_time_min || 4) * 45; // expected target read time
      const timeScore = Math.min(100, (avgTime / targetTimeSec) * 100);
      const viewScore = (views / maxViews) * 100;
      const scrollScore = avgScroll;
      const ctrScore = Math.min(100, (ctr / 25) * 100);

      const engagementScore = Math.round(
        (viewScore * 0.35) + 
        (timeScore * 0.30) + 
        (scrollScore * 0.20) + 
        (ctrScore * 0.15)
      );

      return {
        id: art.id,
        slug: art.slug,
        title: art.title,
        category: art.category,
        author: art.author,
        publishDate: art.publish_date,
        readTimeMin: art.read_time_min,
        wordCount: art.word_count,
        views,
        sessions: art.sessions || 0,
        avgTimeSpent: avgTime,
        avgScrollDepth: avgScroll,
        ctr,
        engagementScore
      };
    });

    // Sort
    formattedArticles.sort((a, b) => {
      const fieldA = a[sortBy] ?? 0;
      const fieldB = b[sortBy] ?? 0;
      return order === 'asc' ? (fieldA > fieldB ? 1 : -1) : (fieldA < fieldB ? 1 : -1);
    });

    const topPerformers = [...formattedArticles].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 5);
    const underPerformers = [...formattedArticles].sort((a, b) => a.engagementScore - b.engagementScore).slice(0, 5);

    // Category aggregations
    const categoryStats = queryAll(`
      SELECT 
        a.category,
        COUNT(DISTINCT a.id) AS article_count,
        COUNT(pv.view_id) AS total_views,
        AVG(pv.time_spent) AS avg_time,
        AVG(pv.scroll_depth_pct) AS avg_scroll,
        SUM(pv.clicked_recommendation) AS total_rec_clicks
      FROM articles a
      LEFT JOIN page_views pv ON a.id = pv.article_id
      LEFT JOIN user_sessions s ON pv.session_id = s.session_id
      ${whereClause}
      GROUP BY a.category
      ORDER BY total_views DESC
    `, params).map(c => {
      const views = c.total_views || 0;
      const clicks = c.total_rec_clicks || 0;
      return {
        category: c.category,
        articleCount: c.article_count,
        totalViews: views,
        avgTimeSpent: Math.round(c.avg_time || 0),
        avgScrollDepth: Math.round(c.avg_scroll || 0),
        ctr: views > 0 ? Number(((clicks / views) * 100).toFixed(1)) : 0
      };
    });

    res.json({
      success: true,
      data: {
        articles: formattedArticles,
        topPerformers,
        underPerformers,
        categoryStats,
        totalArticlesCount: formattedArticles.length
      }
    });
  } catch (error) {
    console.error('Error in getContentPerformance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getUserNavigation(req, res) {
  try {
    const filters = {
      dateRange: req.query.dateRange || '30d',
      category: req.query.category || 'all',
      deviceType: req.query.deviceType || 'all'
    };

    const navData = navigationEngine.getUserNavigationData(filters);
    res.json({
      success: true,
      data: navData
    });
  } catch (error) {
    console.error('Error in getUserNavigation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getRecommendations(req, res) {
  try {
    const filters = {
      dateRange: req.query.dateRange || '30d'
    };

    const recommendations = recommendationEngine.generateRecommendations(filters);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getHeatmap(req, res) {
  try {
    const { dateRange = '30d', category = 'all', deviceType = 'all' } = req.query;
    const dates = metricsEngine.parseDateFilter(dateRange);

    let whereClause = `WHERE pv.timestamp >= ? AND pv.timestamp <= ?`;
    let params = [dates.currentStart, dates.currentEnd];

    if (deviceType !== 'all') {
      whereClause += ` AND s.device_type = ?`;
      params.push(deviceType);
    }
    if (category !== 'all') {
      whereClause += ` AND a.category = ?`;
      params.push(category);
    }

    // Hourly x Day of Week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
    const rawHourly = queryAll(`
      SELECT 
        CAST(strftime('%w', pv.timestamp) AS INTEGER) AS day_of_week,
        CAST(strftime('%H', pv.timestamp) AS INTEGER) AS hour_of_day,
        COUNT(pv.view_id) AS views,
        AVG(pv.time_spent) AS avg_time
      FROM page_views pv
      JOIN user_sessions s ON pv.session_id = s.session_id
      LEFT JOIN articles a ON pv.article_id = a.id
      ${whereClause}
      GROUP BY day_of_week, hour_of_day
    `, params);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const matrix = [];

    for (let d = 0; d < 7; d++) {
      const row = { day: days[d], dayIndex: d, hours: [] };
      for (let h = 0; h < 24; h++) {
        const match = rawHourly.find(r => r.day_of_week === d && r.hour_of_day === h);
        row.hours.push({
          hour: h,
          views: match ? match.views : 0,
          avgTime: match ? Math.round(match.avg_time) : 0
        });
      }
      matrix.push(row);
    }

    // Category x Device Matrix
    const catDevice = queryAll(`
      SELECT 
        a.category,
        s.device_type,
        COUNT(pv.view_id) AS views,
        AVG(pv.time_spent) AS avg_time,
        AVG(pv.scroll_depth_pct) AS avg_scroll
      FROM page_views pv
      JOIN user_sessions s ON pv.session_id = s.session_id
      JOIN articles a ON pv.article_id = a.id
      ${whereClause}
      GROUP BY a.category, s.device_type
    `, params);

    res.json({
      success: true,
      data: {
        heatmap: matrix,
        categoryDeviceMatrix: catDevice
      }
    });
  } catch (error) {
    console.error('Error in getHeatmap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getArticleDetail(req, res) {
  try {
    const { id } = req.params;
    const numId = Number(id);
    const article = !isNaN(numId)
      ? queryOne('SELECT * FROM articles WHERE id = ? OR slug = ?', [numId, id])
      : queryOne('SELECT * FROM articles WHERE slug = ?', [id]);

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Get article stats
    const stats = queryOne(`
      SELECT 
        COUNT(pv.view_id) AS total_views,
        COUNT(DISTINCT pv.session_id) AS total_sessions,
        AVG(pv.time_spent) AS avg_time_spent,
        AVG(pv.scroll_depth_pct) AS avg_scroll_depth,
        SUM(pv.clicked_recommendation) AS rec_clicks
      FROM page_views pv
      WHERE pv.article_id = ?
    `, [article.id]) || {};

    const deviceBreakdown = queryAll(`
      SELECT 
        s.device_type,
        COUNT(pv.view_id) AS views,
        AVG(pv.time_spent) AS avg_time
      FROM page_views pv
      JOIN user_sessions s ON pv.session_id = s.session_id
      WHERE pv.article_id = ?
      GROUP BY s.device_type
    `, [article.id]);

    const trafficBreakdown = queryAll(`
      SELECT 
        s.traffic_source,
        COUNT(pv.view_id) AS views
      FROM page_views pv
      JOIN user_sessions s ON pv.session_id = s.session_id
      WHERE pv.article_id = ?
      GROUP BY s.traffic_source
    `, [article.id]);

    res.json({
      success: true,
      data: {
        article,
        stats: {
          totalViews: stats.total_views || 0,
          totalSessions: stats.total_sessions || 0,
          avgTimeSpent: Math.round(stats.avg_time_spent || 0),
          avgScrollDepth: Math.round(stats.avg_scroll_depth || 0),
          ctr: stats.total_views > 0 ? Number(((stats.rec_clicks / stats.total_views) * 100).toFixed(1)) : 0
        },
        deviceBreakdown,
        trafficBreakdown
      }
    });
  } catch (error) {
    console.error('Error in getArticleDetail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function simulateEvent(req, res) {
  try {
    const { category, deviceType = 'mobile', isEngaged = true } = req.body || {};
    const articles = queryAll('SELECT id, slug, category, read_time_min FROM articles');

    const candidateArticles = category 
      ? articles.filter(a => a.category.toLowerCase() === category.toLowerCase())
      : articles;
    const selectedArticle = candidateArticles[Math.floor(Math.random() * candidateArticles.length)] || articles[0];

    const now = new Date();
    const sessionId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const userId = `usr_sim_${Math.floor(Math.random() * 9999)}`;
    const entryPage = `/article/${selectedArticle.slug}`;
    const trafficSources = ['social_media', 'organic_search', 'direct', 'newsletter'];
    const trafficSource = trafficSources[Math.floor(Math.random() * trafficSources.length)];

    if (!isEngaged) {
      // Bounce simulation
      const timeSpent = Math.floor(8 + Math.random() * 15);
      runStmt(`
        INSERT INTO user_sessions (session_id, user_id, entry_page, exit_page, duration, bounce_status, device_type, traffic_source, country, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [sessionId, userId, entryPage, entryPage, timeSpent, 1, deviceType, trafficSource, 'United States', now.toISOString()]);

      runStmt(`
        INSERT INTO page_views (session_id, article_id, page_url, timestamp, time_spent, scroll_depth_pct, clicked_recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [sessionId, selectedArticle.id, entryPage, now.toISOString(), timeSpent, 20, 0]);
    } else {
      // Engaged session simulation (2 pageviews)
      const secondArticle = articles.find(a => a.id !== selectedArticle.id) || articles[0];
      const time1 = Math.floor(45 + Math.random() * 80);
      const time2 = Math.floor(60 + Math.random() * 90);
      const totalDuration = time1 + time2;

      runStmt(`
        INSERT INTO user_sessions (session_id, user_id, entry_page, exit_page, duration, bounce_status, device_type, traffic_source, country, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [sessionId, userId, entryPage, `/article/${secondArticle.slug}`, totalDuration, 0, deviceType, trafficSource, 'United States', now.toISOString()]);

      runStmt(`
        INSERT INTO page_views (session_id, article_id, page_url, timestamp, time_spent, scroll_depth_pct, clicked_recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [sessionId, selectedArticle.id, entryPage, now.toISOString(), time1, 85, 1]);

      const timeView2 = new Date(now.getTime() + time1 * 1000);
      runStmt(`
        INSERT INTO page_views (session_id, article_id, page_url, timestamp, time_spent, scroll_depth_pct, clicked_recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [sessionId, secondArticle.id, `/article/${secondArticle.slug}`, timeView2.toISOString(), time2, 90, 0]);
    }

    res.json({
      success: true,
      message: 'Simulated reader event recorded',
      event: {
        sessionId,
        article: selectedArticle.title,
        category: selectedArticle.category,
        device: deviceType,
        isEngaged
      }
    });
  } catch (error) {
    console.error('Error in simulateEvent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export function resetData(req, res) {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to baseline dataset' });
  } catch (error) {
    console.error('Error in resetData:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default {
  getMetrics,
  getContentPerformance,
  getUserNavigation,
  getRecommendations,
  getHeatmap,
  getArticleDetail,
  simulateEvent,
  resetData
};
