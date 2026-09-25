import { queryAll, queryOne } from '../db/database.js';
import { parseDateFilter } from './metricsEngine.js';

export function generateRecommendations(filters = {}) {
  const { dateRange = '30d' } = filters;
  const dates = parseDateFilter(dateRange);

  const recommendations = [];

  // 1. Analyze Mobile vs Desktop Bounce Rate
  const deviceStats = queryAll(`
    SELECT 
      device_type,
      COUNT(*) AS total_sessions,
      SUM(CASE WHEN bounce_status = 1 THEN 1 ELSE 0 END) AS bounced_sessions,
      AVG(duration) AS avg_duration
    FROM user_sessions
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY device_type
  `, [dates.currentStart, dates.currentEnd]);

  const mobile = deviceStats.find(d => d.device_type === 'mobile');
  const desktop = deviceStats.find(d => d.device_type === 'desktop');

  if (mobile && desktop && mobile.total_sessions > 20) {
    const mobileBounce = (mobile.bounced_sessions / mobile.total_sessions) * 100;
    const desktopBounce = (desktop.bounced_sessions / desktop.total_sessions) * 100;
    const diff = mobileBounce - desktopBounce;

    if (mobileBounce > 50 || diff > 10) {
      recommendations.push({
        id: 'rec_mobile_bounce',
        severity: 'high',
        category: 'UX & Performance',
        title: 'High Mobile Bounce Rate Detected',
        insight: `Mobile readers bounce at ${mobileBounce.toFixed(1)}%, which is ${diff.toFixed(1)}% higher than desktop users (${desktopBounce.toFixed(1)}%).`,
        action: 'Implement deferral on mobile display ads, reduce CLS (Cumulative Layout Shift) from header banners, and enable an immediate reading mode with responsive typography.',
        expectedImpact: '-12% to -18% mobile bounce reduction, +25s average reading time',
        metricsData: {
          mobileBounce: Number(mobileBounce.toFixed(1)),
          desktopBounce: Number(desktopBounce.toFixed(1)),
          mobileSessions: mobile.total_sessions
        }
      });
    }
  }

  // 2. Analyze Categories for High Dwell Time but Low Recommendation CTR
  const categoryEngagement = queryAll(`
    SELECT 
      a.category,
      COUNT(pv.view_id) AS total_views,
      AVG(pv.time_spent) AS avg_time,
      AVG(pv.scroll_depth_pct) AS avg_scroll,
      SUM(pv.clicked_recommendation) AS rec_clicks
    FROM page_views pv
    JOIN articles a ON pv.article_id = a.id
    WHERE pv.timestamp >= ? AND pv.timestamp <= ?
    GROUP BY a.category
    HAVING total_views >= 20
  `, [dates.currentStart, dates.currentEnd]);

  for (const cat of categoryEngagement) {
    const ctr = (cat.rec_clicks / cat.total_views) * 100;
    if (cat.avg_time > 150 && ctr < 12) {
      recommendations.push({
        id: `rec_ctr_${cat.category.toLowerCase()}`,
        severity: 'medium',
        category: 'Editorial Strategy',
        title: `Underutilized High-Dwell Time in ${cat.category}`,
        insight: `${cat.category} articles achieve an outstanding average dwell time of ${Math.round(cat.avg_time)}s, but only ${ctr.toFixed(1)}% of readers click through to a recommended story.`,
        action: `Introduce contextual mid-article "Read Next" recommendation cards rather than relying solely on end-of-article widgets.`,
        expectedImpact: `+4.5% to +8.0% recommendation CTR, converting single-story readers into multi-article sessions`,
        metricsData: {
          category: cat.category,
          avgTimeSec: Math.round(cat.avg_time),
          ctr: Number(ctr.toFixed(1)),
          totalViews: cat.total_views
        }
      });
    }
  }

  // 3. Analyze Scroll Depth Fall-off
  const scrollStats = queryOne(`
    SELECT 
      COUNT(*) AS total_views,
      SUM(CASE WHEN scroll_depth_pct >= 25 THEN 1 ELSE 0 END) AS r25,
      SUM(CASE WHEN scroll_depth_pct >= 50 THEN 1 ELSE 0 END) AS r50
    FROM page_views
    WHERE timestamp >= ? AND timestamp <= ?
  `, [dates.currentStart, dates.currentEnd]);

  if (scrollStats && scrollStats.r25 > 0) {
    const dropOffPct = ((scrollStats.r25 - scrollStats.r50) / scrollStats.r25) * 100;
    if (dropOffPct > 28) {
      recommendations.push({
        id: 'rec_scroll_midpoint',
        severity: 'medium',
        category: 'Content Structure',
        title: 'Steep Reader Drop-Off at Article Midpoint',
        insight: `${dropOffPct.toFixed(1)}% of readers who reach the 25% scroll mark abandon the page before reaching 50% depth.`,
        action: 'Break up long walls of text at the 35% mark with interactive data tables, visual pull-quotes, or embedded media summaries.',
        expectedImpact: '+15% deeper scroll completion, increased ad viewability',
        metricsData: {
          dropOffPct: Number(dropOffPct.toFixed(1)),
          reach25: scrollStats.r25,
          reach50: scrollStats.r50
        }
      });
    }
  }

  // 4. Traffic Source Analysis (Newsletter / Direct loyalty)
  const trafficLoyalty = queryAll(`
    SELECT 
      traffic_source,
      COUNT(*) AS sessions,
      SUM(CASE WHEN bounce_status = 1 THEN 1 ELSE 0 END) AS bounced,
      AVG(duration) AS avg_duration
    FROM user_sessions
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY traffic_source
  `, [dates.currentStart, dates.currentEnd]);

  const newsletter = trafficLoyalty.find(t => t.traffic_source === 'newsletter');
  const social = trafficLoyalty.find(t => t.traffic_source === 'social_media');

  if (newsletter && social && newsletter.sessions > 10) {
    const nlBounce = (newsletter.bounced / newsletter.sessions) * 100;
    const socBounce = (social.bounced / social.sessions) * 100;
    recommendations.push({
      id: 'rec_newsletter_growth',
      severity: 'info',
      category: 'Audience Growth',
      title: 'Double Down on Newsletter Acquisition',
      insight: `Newsletter subscribers demonstrate superior engagement: ${nlBounce.toFixed(1)}% bounce rate vs ${socBounce.toFixed(1)}% on social media, with ${Math.round(newsletter.avg_duration)}s average session duration.`,
      action: 'Deploy targeted 1-click email newsletter signup overlays for first-time visitors finishing their 2nd article.',
      expectedImpact: '+35% growth in high-loyalty recurring subscriber base',
      metricsData: {
        newsletterBounce: Number(nlBounce.toFixed(1)),
        socialBounce: Number(socBounce.toFixed(1)),
        newsletterDuration: Math.round(newsletter.avg_duration)
      }
    });
  }

  // 5. Category Performance Disparity
  if (categoryEngagement.length >= 2) {
    const sorted = [...categoryEngagement].sort((a, b) => b.total_views - a.total_views);
    const topCat = sorted[0];
    const bottomCat = sorted[sorted.length - 1];

    recommendations.push({
      id: 'rec_editorial_balance',
      severity: 'info',
      category: 'Editorial Strategy',
      title: `Editorial Traffic Distribution: ${topCat.category} Leads vs ${bottomCat.category}`,
      insight: `${topCat.category} drives ${topCat.total_views} views (${Math.round(topCat.avg_time)}s avg read), while ${bottomCat.category} trails at ${bottomCat.total_views} views.`,
      action: `Cross-pollinate traffic by featuring top ${bottomCat.category} stories inside ${topCat.category} article sidebars and morning roundups.`,
      expectedImpact: '+20% uplift in secondary category readership',
      metricsData: {
        topCategory: topCat.category,
        topViews: topCat.total_views,
        bottomCategory: bottomCat.category,
        bottomViews: bottomCat.total_views
      }
    });
  }

  return recommendations;
}

export default {
  generateRecommendations
};
