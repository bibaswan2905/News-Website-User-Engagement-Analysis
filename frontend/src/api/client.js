const API_BASE = '/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchMetrics(filters = {}) {
  const res = await fetch(`${API_BASE}/metrics${buildQuery(filters)}`);
  if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.statusText}`);
  return res.json();
}

export async function fetchContentPerformance(filters = {}, sortBy = 'views', order = 'desc') {
  const res = await fetch(`${API_BASE}/content-performance${buildQuery({ ...filters, sortBy, order })}`);
  if (!res.ok) throw new Error(`Failed to fetch content performance: ${res.statusText}`);
  return res.json();
}

export async function fetchUserNavigation(filters = {}) {
  const res = await fetch(`${API_BASE}/user-navigation${buildQuery(filters)}`);
  if (!res.ok) throw new Error(`Failed to fetch user navigation: ${res.statusText}`);
  return res.json();
}

export async function fetchRecommendations(filters = {}) {
  const res = await fetch(`${API_BASE}/recommendations${buildQuery(filters)}`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
  return res.json();
}

export async function fetchHeatmap(filters = {}) {
  const res = await fetch(`${API_BASE}/heatmap${buildQuery(filters)}`);
  if (!res.ok) throw new Error(`Failed to fetch heatmap data: ${res.statusText}`);
  return res.json();
}

export async function fetchArticleDetail(id) {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch article details: ${res.statusText}`);
  return res.json();
}

export async function simulateEvent(payload = {}) {
  const res = await fetch(`${API_BASE}/simulate-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to simulate event: ${res.statusText}`);
  return res.json();
}

export async function resetData() {
  const res = await fetch(`${API_BASE}/reset-data`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to reset data: ${res.statusText}`);
  return res.json();
}

export default {
  fetchMetrics,
  fetchContentPerformance,
  fetchUserNavigation,
  fetchRecommendations,
  fetchHeatmap,
  fetchArticleDetail,
  simulateEvent,
  resetData
};
