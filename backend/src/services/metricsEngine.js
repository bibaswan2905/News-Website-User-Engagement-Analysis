import { queryAll, queryOne } from '../db/database.js';

export function parseDateFilter(dateRange = '30d') {
  const now = new Date();
  let days = 30;
  if (dateRange === 'today') days = 1;
  else if (dateRange === '7d') days = 7;
  else if (dateRange === '30d') days = 30;
  else if (dateRange === '90d') days = 90;

  const currentStart = new Date(now.getTime() - days * 86400000);
  const previousStart = new Date(now.getTime() - days * 2 * 86400000);

  return {
    days,
    currentStart: currentStart.toISOString(),
    currentEnd: now.toISOString(),
    previousStart: previousStart.toISOString(),
    previousEnd: currentStart.toISOString()
  };
}

export function buildWhereClause(filters = {}, prefix = 's') {
  const { dateRange, category, deviceType } = filters;
  const conditions = [];
  const params = [];

  const dates = parseDateFilter(dateRange);
  conditions.push(`${prefix}.created_at >= ? AND ${prefix}.created_at <= ?`);
  params.push(dates.currentStart, dates.currentEnd);

  if (deviceType && deviceType !== 'all') {
    conditions.push(`${prefix}.device_type = ?`);
    params.push(deviceType);
  }

  // Category filter is applied if filtering on article views or joined sessions
  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    dates
  };
}

export function calculateSummaryMetrics(filters = {}) {
  const { dateRange = '30d', category, deviceType } = filters;
  const dates = parseDateFilter(dateRange);

  // Helper to query metrics for a specific window
  const queryWindow = (startIso, endIso) => {
    let sessionWhere = `WHERE s.created_at >= ? AND s.created_at <= ?`;
    let sessionParams = [startIso, endIso];

    if (deviceType && deviceType !== 'all') {
      sessionWhere += ` AND s.device_type = ?`;
      sessionParams.push(deviceType);
    }

    if (category && category !== 'all') {
      sessionWhere += ` AND EXISTS (
        SELECT 1 FROM page_views pv 
        JOIN articles a ON pv.article_id = a.id 
        WHERE pv.session_id = s.session_id AND a.category = ?
      )`;
      sessionParams.push(category);
    }

    const sessionStats = queryOne(`
      SELECT 
        COUNT(s.session_id) AS total_sessions,
        COUNT(DISTINCT s.user_id) AS unique_visitors,
        SUM(CASE WHEN s.bounce_status = 1 THEN 1 ELSE 0 END) AS bounced_sessions,
        AVG(s.duration) AS avg_duration
      FROM user_sessions s
      ${sessionWhere}
    `, sessionParams) || {};

    let pvWhere = `WHERE pv.timestamp >= ? AND pv.timestamp <= ?`;
    let pvParams = [startIso, endIso];

    if (deviceType && deviceType !== 'all') {
      pvWhere += ` AND s.device_type = ?`;
      pvParams.push(deviceType);
    }
    if (category && category !== 'all') {
      pvWhere += ` AND a.category = ?`;
      pvParams.push(category);
    }

    const pvStats = queryOne(`
      SELECT 
        COUNT(pv.view_id) AS total_views,
        AVG(pv.time_spent) AS avg_time_on_page,
        AVG(pv.scroll_depth_pct) AS avg_scroll_depth,
        SUM(pv.clicked_recommendation) AS total_rec_clicks
      FROM page_views pv
      JOIN user_sessions s ON pv.session_id = s.session_id
      LEFT JOIN articles a ON pv.article_id = a.id
      ${pvWhere}
    `, pvParams) || {};

    const totalSessions = sessionStats.total_sessions || 0;
    const bouncedSessions = sessionStats.bounced_sessions || 0;
    const totalViews = pvStats.total_views || 0;
    const totalRecClicks = pvStats.total_rec_clicks || 0;

    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
    const avgDuration = sessionStats.avg_duration || 0;
    const avgTimeOnPage = pvStats.avg_time_on_page || 0;
    const avgScrollDepth = pvStats.avg_scroll_depth || 0;
    const ctr = totalViews > 0 ? (totalRecClicks / totalViews) * 100 : 0;

    return {
      totalViews,
      totalSessions,
      uniqueVisitors: sessionStats.unique_visitors || 0,
      bounceRate: Number(bounceRate.toFixed(1)),
      avgDuration: Math.round(avgDuration),
      avgTimeOnPage: Math.round(avgTimeOnPage),
      avgScrollDepth: Number(avgScrollDepth.toFixed(1)),
      ctr: Number(ctr.toFixed(1))
    };
  };

  const current = queryWindow(dates.currentStart, dates.currentEnd);
  const previous = queryWindow(dates.previousStart, dates.previousEnd);

  // Calculate delta percentage
  const calcDelta = (curr, prev) => {
    if (!prev || prev === 0) return 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  const deltas = {
    totalViews: calcDelta(current.totalViews, previous.totalViews),
    totalSessions: calcDelta(current.totalSessions, previous.totalSessions),
    uniqueVisitors: calcDelta(current.uniqueVisitors, previous.uniqueVisitors),
    // For bounce rate, negative delta is improvement
    bounceRate: Number((current.bounceRate - previous.bounceRate).toFixed(1)),
    avgDuration: calcDelta(current.avgDuration, previous.avgDuration),
    avgTimeOnPage: calcDelta(current.avgTimeOnPage, previous.avgTimeOnPage),
    ctr: Number((current.ctr - previous.ctr).toFixed(1))
  };

  return {
    current,
    previous,
    deltas,
    dateRange,
    rangeLabels: {
      from: dates.currentStart,
      to: dates.currentEnd
    }
  };
}

export function getTimelineMetrics(filters = {}) {
  const { dateRange = '30d', category, deviceType } = filters;
  const dates = parseDateFilter(dateRange);

  let where = `WHERE pv.timestamp >= ? AND pv.timestamp <= ?`;
  let params = [dates.currentStart, dates.currentEnd];

  if (deviceType && deviceType !== 'all') {
    where += ` AND s.device_type = ?`;
    params.push(deviceType);
  }
  if (category && category !== 'all') {
    where += ` AND a.category = ?`;
    params.push(category);
  }

  // If dateRange is 'today', group by hour; otherwise group by date
  const isHourly = dateRange === 'today';
  const timeFormat = isHourly ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

  const rows = queryAll(`
    SELECT 
      strftime('${timeFormat}', pv.timestamp) AS time_slot,
      COUNT(pv.view_id) AS views,
      COUNT(DISTINCT pv.session_id) AS sessions,
      AVG(pv.time_spent) AS avg_time,
      SUM(pv.clicked_recommendation) AS rec_clicks
    FROM page_views pv
    JOIN user_sessions s ON pv.session_id = s.session_id
    LEFT JOIN articles a ON pv.article_id = a.id
    ${where}
    GROUP BY time_slot
    ORDER BY time_slot ASC
  `, params);

  return rows.map(r => ({
    label: isHourly ? r.time_slot.split(' ')[1] : r.time_slot.slice(5), // 'HH:00' or 'MM-DD'
    fullTimestamp: r.time_slot,
    views: r.views,
    sessions: r.sessions,
    avgTime: Math.round(r.avg_time || 0),
    recClicks: r.rec_clicks || 0
  }));
}

export function getDistributionMetrics(filters = {}) {
  const { dateRange = '30d', category, deviceType } = filters;
  const dates = parseDateFilter(dateRange);

  let sessionWhere = `WHERE s.created_at >= ? AND s.created_at <= ?`;
  let sessionParams = [dates.currentStart, dates.currentEnd];
  if (deviceType && deviceType !== 'all') {
    sessionWhere += ` AND s.device_type = ?`;
    sessionParams.push(deviceType);
  }

  // Device Breakdown
  const devices = queryAll(`
    SELECT 
      device_type,
      COUNT(*) AS count,
      AVG(duration) AS avg_duration,
      SUM(CASE WHEN bounce_status = 1 THEN 1 ELSE 0 END) AS bounced
    FROM user_sessions s
    ${sessionWhere}
    GROUP BY device_type
  `, sessionParams).map(d => ({
    name: d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1),
    device: d.device_type,
    count: d.count,
    avgDuration: Math.round(d.avg_duration || 0),
    bounceRate: d.count > 0 ? Number(((d.bounced / d.count) * 100).toFixed(1)) : 0
  }));

  // Traffic Sources Breakdown
  const trafficSources = queryAll(`
    SELECT 
      traffic_source,
      COUNT(*) AS count
    FROM user_sessions s
    ${sessionWhere}
    GROUP BY traffic_source
    ORDER BY count DESC
  `, sessionParams).map(t => ({
    source: t.traffic_source.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: t.count
  }));

  // Category Distribution from page_views
  let pvWhere = `WHERE pv.timestamp >= ? AND pv.timestamp <= ? AND a.category IS NOT NULL`;
  let pvParams = [dates.currentStart, dates.currentEnd];
  if (deviceType && deviceType !== 'all') {
    pvWhere += ` AND s.device_type = ?`;
    pvParams.push(deviceType);
  }

  const categoryDistribution = queryAll(`
    SELECT 
      a.category,
      COUNT(pv.view_id) AS views,
      AVG(pv.time_spent) AS avg_time,
      AVG(pv.scroll_depth_pct) AS avg_scroll
    FROM page_views pv
    JOIN user_sessions s ON pv.session_id = s.session_id
    JOIN articles a ON pv.article_id = a.id
    ${pvWhere}
    GROUP BY a.category
    ORDER BY views DESC
  `, pvParams).map(c => ({
    category: c.category,
    views: c.views,
    avgTime: Math.round(c.avg_time || 0),
    avgScroll: Math.round(c.avg_scroll || 0)
  }));

  return {
    devices,
    trafficSources,
    categoryDistribution
  };
}

export default {
  calculateSummaryMetrics,
  getTimelineMetrics,
  getDistributionMetrics,
  parseDateFilter
};
