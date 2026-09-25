import test from 'node:test';
import assert from 'node:assert';
import metricsEngine from '../src/services/metricsEngine.js';
import navigationEngine from '../src/services/navigationEngine.js';
import recommendationEngine from '../src/services/recommendationEngine.js';

test('metricsEngine calculates summary metrics correctly', () => {
  const result = metricsEngine.calculateSummaryMetrics({ dateRange: '30d' });
  assert.ok(result.current, 'Should have current metrics');
  assert.ok(result.current.totalViews > 0, 'Total views should be greater than 0');
  assert.ok(result.current.totalSessions > 0, 'Total sessions should be greater than 0');
  assert.ok(result.current.bounceRate >= 0 && result.current.bounceRate <= 100, 'Bounce rate should be between 0 and 100%');
  assert.ok(result.deltas, 'Should have period-over-period deltas');
});

test('metricsEngine returns timeline and distributions', () => {
  const timeline = metricsEngine.getTimelineMetrics({ dateRange: '7d' });
  assert.ok(Array.isArray(timeline), 'Timeline should be an array');
  assert.ok(timeline.length > 0, 'Timeline should have data points');

  const distributions = metricsEngine.getDistributionMetrics({ dateRange: '30d' });
  assert.ok(distributions.devices.length > 0, 'Should have device distribution');
  assert.ok(distributions.trafficSources.length > 0, 'Should have traffic sources');
  assert.ok(distributions.categoryDistribution.length > 0, 'Should have category distribution');
});

test('navigationEngine returns complete 4-stage funnel and drop-off stats', () => {
  const nav = navigationEngine.getUserNavigationData({ dateRange: '30d' });
  assert.strictEqual(nav.funnel.length, 4, 'Funnel should have 4 stages');
  assert.strictEqual(nav.funnel[0].id, 'step_entry');
  assert.ok(nav.topEntryPages.length > 0, 'Should have top entry pages');
  assert.ok(nav.topExitPages.length > 0, 'Should have top exit pages');
  assert.strictEqual(nav.scrollMilestones.length, 5, 'Should have 5 scroll milestones');
});

test('recommendationEngine generates rule-based insights', () => {
  const recs = recommendationEngine.generateRecommendations({ dateRange: '30d' });
  assert.ok(Array.isArray(recs), 'Recommendations should be an array');
  assert.ok(recs.length > 0, 'Should produce at least one actionable recommendation');
  assert.ok(recs[0].title, 'Recommendation must have a title');
  assert.ok(recs[0].action, 'Recommendation must have an action');
  assert.ok(recs[0].expectedImpact, 'Recommendation must have an expected impact');
});
