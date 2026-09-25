import { queryAll, queryOne } from '../db/database.js';
import { parseDateFilter } from './metricsEngine.js';

export function getUserNavigationData(filters = {}) {
  const { dateRange = '30d', category, deviceType } = filters;
  const dates = parseDateFilter(dateRange);

  let sessionWhere = `WHERE s.created_at >= ? AND s.created_at <= ?`;
  let sessionParams = [dates.currentStart, dates.currentEnd];

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

  // 1. Funnel Stages
  const totalSessionsRow = queryOne(`
    SELECT COUNT(*) as total FROM user_sessions s ${sessionWhere}
  `, sessionParams);
  const totalSessions = totalSessionsRow ? totalSessionsRow.total : 0;

  // Stage 2: Engaged Reading (duration > 15s and bounce_status = 0 or scroll_depth > 30)
  const engagedRow = queryOne(`
    SELECT COUNT(DISTINCT s.session_id) as count
    FROM user_sessions s
    JOIN page_views pv ON s.session_id = pv.session_id
    ${sessionWhere} AND (s.duration >= 15 OR pv.scroll_depth_pct >= 30)
  `, sessionParams);
  const stageEngaged = engagedRow ? engagedRow.count : 0;

  // Stage 3: Clicked Recommendation / Related Story
  const recRow = queryOne(`
    SELECT COUNT(DISTINCT s.session_id) as count
    FROM user_sessions s
    JOIN page_views pv ON s.session_id = pv.session_id
    ${sessionWhere} AND pv.clicked_recommendation = 1
  `, sessionParams);
  const stageRecClick = recRow ? recRow.count : 0;

  // Stage 4: Deep Explorer (3+ pageviews or duration >= 180s)
  const deepRow = queryOne(`
    SELECT COUNT(DISTINCT s.session_id) as count
    FROM user_sessions s
    ${sessionWhere} AND (
      s.duration >= 180 OR 
      (SELECT COUNT(*) FROM page_views pv2 WHERE pv2.session_id = s.session_id) >= 3
    )
  `, sessionParams);
  const stageDeep = deepRow ? deepRow.count : 0;

  const funnel = [
    {
      id: 'step_entry',
      name: '1. Site Entry',
      description: 'User arrives on homepage, category index, or direct story',
      count: totalSessions,
      conversionPct: 100,
      dropOffPct: totalSessions > 0 ? Number((((totalSessions - stageEngaged) / totalSessions) * 100).toFixed(1)) : 0,
      dropOffCount: totalSessions - stageEngaged
    },
    {
      id: 'step_read',
      name: '2. Engaged Reading',
      description: 'Reader scrolls >30% or spends >15s on an article',
      count: stageEngaged,
      conversionPct: totalSessions > 0 ? Number(((stageEngaged / totalSessions) * 100).toFixed(1)) : 0,
      dropOffPct: stageEngaged > 0 ? Number((((stageEngaged - stageRecClick) / stageEngaged) * 100).toFixed(1)) : 0,
      dropOffCount: stageEngaged - stageRecClick
    },
    {
      id: 'step_recommendation',
      name: '3. Next Story Click',
      description: 'Engaged with related article, category link, or recommendation',
      count: stageRecClick,
      conversionPct: totalSessions > 0 ? Number(((stageRecClick / totalSessions) * 100).toFixed(1)) : 0,
      dropOffPct: stageRecClick > 0 ? Number((((stageRecClick - stageDeep) / stageRecClick) * 100).toFixed(1)) : 0,
      dropOffCount: stageRecClick - stageDeep
    },
    {
      id: 'step_loyal',
      name: '4. Deep Exploration',
      description: 'High-value session reading 3+ articles or >3 min dwell time',
      count: stageDeep,
      conversionPct: totalSessions > 0 ? Number(((stageDeep / totalSessions) * 100).toFixed(1)) : 0,
      dropOffPct: 0,
      dropOffCount: 0
    }
  ];

  // 2. Top Entry Pages with Bounce Rate
  const topEntryPages = queryAll(`
    SELECT 
      s.entry_page AS page,
      COUNT(s.session_id) AS entries,
      SUM(CASE WHEN s.bounce_status = 1 THEN 1 ELSE 0 END) AS bounces,
      AVG(s.duration) AS avg_duration
    FROM user_sessions s
    ${sessionWhere}
    GROUP BY s.entry_page
    ORDER BY entries DESC
    LIMIT 8
  `, sessionParams).map(p => ({
    page: p.page,
    entries: p.entries,
    bounceRate: p.entries > 0 ? Number(((p.bounces / p.entries) * 100).toFixed(1)) : 0,
    avgDuration: Math.round(p.avg_duration || 0)
  }));

  // 3. Top Exit Pages
  const topExitPages = queryAll(`
    SELECT 
      s.exit_page AS page,
      COUNT(s.session_id) AS exits,
      AVG(s.duration) AS avg_session_duration
    FROM user_sessions s
    ${sessionWhere}
    GROUP BY s.exit_page
    ORDER BY exits DESC
    LIMIT 8
  `, sessionParams).map(p => ({
    page: p.page,
    exits: p.exits,
    exitRate: totalSessions > 0 ? Number(((p.exits / totalSessions) * 100).toFixed(1)) : 0,
    avgSessionDuration: Math.round(p.avg_session_duration || 0)
  }));

  // 4. Scroll Depth Milestones Drop-off
  let pvWhere = `WHERE pv.timestamp >= ? AND pv.timestamp <= ?`;
  let pvParams = [dates.currentStart, dates.currentEnd];
  if (deviceType && deviceType !== 'all') {
    pvWhere += ` AND s.device_type = ?`;
    pvParams.push(deviceType);
  }
  if (category && category !== 'all') {
    pvWhere += ` AND a.category = ?`;
    pvParams.push(category);
  }

  const scrollStats = queryOne(`
    SELECT 
      COUNT(*) AS total_views,
      SUM(CASE WHEN pv.scroll_depth_pct >= 25 THEN 1 ELSE 0 END) AS reached_25,
      SUM(CASE WHEN pv.scroll_depth_pct >= 50 THEN 1 ELSE 0 END) AS reached_50,
      SUM(CASE WHEN pv.scroll_depth_pct >= 75 THEN 1 ELSE 0 END) AS reached_75,
      SUM(CASE WHEN pv.scroll_depth_pct >= 100 THEN 1 ELSE 0 END) AS reached_100
    FROM page_views pv
    JOIN user_sessions s ON pv.session_id = s.session_id
    LEFT JOIN articles a ON pv.article_id = a.id
    ${pvWhere}
  `, pvParams) || {};

  const totalPv = scrollStats.total_views || 1;
  const scrollMilestones = [
    { milestone: 'Header / 0%', reachCount: totalPv, reachPct: 100 },
    { milestone: 'Intro / 25%', reachCount: scrollStats.reached_25 || 0, reachPct: Number((((scrollStats.reached_25 || 0) / totalPv) * 100).toFixed(1)) },
    { milestone: 'Mid-point / 50%', reachCount: scrollStats.reached_50 || 0, reachPct: Number((((scrollStats.reached_50 || 0) / totalPv) * 100).toFixed(1)) },
    { milestone: 'Key Insights / 75%', reachCount: scrollStats.reached_75 || 0, reachPct: Number((((scrollStats.reached_75 || 0) / totalPv) * 100).toFixed(1)) },
    { milestone: 'Footer / 100%', reachCount: scrollStats.reached_100 || 0, reachPct: Number((((scrollStats.reached_100 || 0) / totalPv) * 100).toFixed(1)) }
  ];

  return {
    funnel,
    topEntryPages,
    topExitPages,
    scrollMilestones,
    totalSessions
  };
}

export default {
  getUserNavigationData
};
