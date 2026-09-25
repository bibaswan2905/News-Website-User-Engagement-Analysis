# News Website User Engagement Analysis 📰📊

A full-stack web application designed for social and web analytics on digital news media websites. It computes key performance indicators (KPIs), tracks multi-stage reader navigation journeys, benchmarks journalistic category performance, detects audience drop-off points, and provides an automated, rule-based editorial recommendation engine.

---

## Architecture Overview

```
news-engagement-analytics/
├── backend/
│   ├── src/
│   │   ├── server.js                     # Express HTTP server (Port 5000)
│   │   ├── db/
│   │   │   ├── database.js               # Node.js 24 native node:sqlite engine
│   │   │   ├── schema.sql                # SQLite schema (articles, user_sessions, page_views)
│   │   │   └── seed.js                   # 30-day realistic news dataset generator
│   │   ├── routes/
│   │   │   └── api.js                    # REST API route endpoints
│   │   ├── controllers/
│   │   │   └── analyticsController.js    # Data aggregation & handler logic
│   │   └── services/
│   │       ├── metricsEngine.js          # KPI calculation & period delta comparison
│   │       ├── navigationEngine.js       # 4-stage funnel & drop-off analytics
│   │       └── recommendationEngine.js   # Rule-based editorial insights & action items
│   └── tests/
│       └── api.test.js                   # Node test runner suite
├── frontend/
│   ├── src/
│   │   ├── api/client.js                 # API service layer
│   │   ├── context/AnalyticsContext.jsx  # Global state (timeframe, category, device filters)
│   │   ├── components/
│   │   │   ├── Header.jsx                # Brand, real-time feed toggle, theme switch
│   │   │   ├── Sidebar.jsx               # Navigation tabs and demo reset
│   │   │   ├── FilterBar.jsx             # Date presets, category, device selectors
│   │   │   ├── KPICards.jsx              # Formatted KPI tiles with % deltas
│   │   │   ├── ArticleDetailModal.jsx    # Drilldown into individual story telemetry
│   │   │   └── ExportModal.jsx           # CSV & JSON reporting
│   │   └── views/
│   │       ├── OverviewDashboard.jsx     # Executive overview, timeline chart & distributions
│   │       ├── ContentPerformance.jsx    # Ranked stories, category bars & search table
│   │       ├── UserNavigationFlow.jsx    # 4-stage visual funnel & drop-off curves
│   │       ├── HeatmapGrid.jsx           # 24/7 day-hour heatmap & device cross-matrix
│   │       ├── RecommendationsPanel.jsx  # Prioritized editorial remediations
│   │       └── LiveSimulator.jsx         # Real-time reader visit injector
│   ├── tailwind.config.js
│   └── vite.config.js                    # Vite dev server with proxy to backend
└── package.json                          # Root orchestration scripts
```

---

## Key Features

### 1. Analytics & Metrics Engine
- **Summary KPIs**: Total Page Views, Total Sessions, Unique Visitors, Average Bounce Rate (%), Average Session Duration (mm:ss), Average Time on Page, and Recommendation Click-Through Rate (CTR).
- **Period-over-Period Delta**: Automatically calculates % change compared to the identical preceding window (e.g. 7 days vs previous 7 days).
- **Composite Engagement Score**:
  $$\text{Score} = \left(\frac{\text{Views}}{\text{MaxViews}} \times 35\right) + \left(\frac{\text{AvgTime}}{\text{TargetTime}} \times 30\right) + \left(\frac{\text{AvgScroll}}{100} \times 20\right) + \left(\frac{\text{CTR}}{25} \times 15\right)$$

### 2. User Navigation & Drop-Off Modeling
- **4-Stage Reading Funnel**:
  1. **Site Entry**: Inbound arrival across homepage, category hubs, or direct article links.
  2. **Engaged Reading**: Sessions with dwell time $\ge 15$s or scroll depth $\ge 30\%$.
  3. **Next Story Click**: Reader clicks an inline or recommended story.
  4. **Deep Exploration**: High-loyalty readers viewing 3+ stories or $\ge 3$ minutes dwell time.
- **Scroll Depth Retention Curve**: Vertical milestone completion at 0%, 25%, 50%, 75%, and 100%.
- **Entry & Departure Tracking**: Top landing URLs with bounce rates and top exit pages with departure percentages.

### 3. Content Beat Performance
- Ranks articles across 6 journalism categories: **Politics, Tech, Entertainment, Sports, Business, and Science**.
- Identifies Top 5 High-Performing vs. Top 5 Underperforming articles with direct drilldown inspection.
- Interactive, sortable, and searchable master telemetry table.

### 4. 24/7 Engagement Heatmap & Cross-Matrices
- Day-of-week (Sunday to Saturday) vs. Hour-of-day (00:00 to 23:00) readership intensity matrix.
- Category $\times$ Device cross-tabulation comparing desktop, mobile, and tablet reading patterns.

### 5. Automated Recommendation Engine
- Generates data-driven editorial and UX suggestions:
  - High Mobile Bounce mitigation (lazy load banners, readability mode).
  - High Dwell Time / Low CTR monetisation (contextual mid-article recommendation cards).
  - Reader drop-off at article midpoint (visual breaks, pull quotes).
  - High-loyalty newsletter acquisition opportunities.

### 6. Real-Time Traffic Simulator
- Inject synthetic reader visits (Mobile/Desktop, Engaged/Bounced, Category) and watch live charts and counters update immediately.
- Optional automated continuous background stream.

---

## Database Model (SQLite)

- **`articles`**: `id`, `slug`, `title`, `category`, `author`, `publish_date`, `read_time_min`, `word_count`, `summary`, `tags`.
- **`user_sessions`**: `session_id`, `user_id`, `entry_page`, `exit_page`, `duration`, `bounce_status`, `device_type`, `traffic_source`, `country`, `created_at`.
- **`page_views`**: `view_id`, `session_id`, `article_id`, `page_url`, `timestamp`, `time_spent`, `scroll_depth_pct`, `clicked_recommendation`.

---

## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/metrics` | Summary KPIs, period deltas, timeline points, and category/device breakdown |
| `GET` | `/api/content-performance` | Ranked articles, category benchmark bar data, top & underperformers |
| `GET` | `/api/user-navigation` | 4-stage journey funnel, scroll retention curve, entry/exit drop-offs |
| `GET` | `/api/recommendations` | Automated actionable editorial & UX recommendations |
| `GET` | `/api/heatmap` | 24/7 hourly readership matrix and category x device cross-matrix |
| `GET` | `/api/articles/:id` | Detailed telemetry and diagnostic feedback for a single story |
| `POST` | `/api/simulate-event` | Inject simulated reader visits into live database |
| `POST` | `/api/reset-data` | Re-seed database with standard baseline dataset |

**Query Parameters Supported on GET endpoints**:
- `dateRange`: `today`, `7d`, `30d` (default), `90d`
- `category`: `all` (default), `Politics`, `Tech`, `Entertainment`, `Sports`, `Business`, `Science`
- `deviceType`: `all` (default), `desktop`, `mobile`, `tablet`
- `sortBy`: `views`, `avgTimeSpent`, `avgScrollDepth`, `ctr`, `engagementScore` (default)
- `order`: `desc` (default), `asc`

---

## How to Run Locally

### Prerequisites
- **Node.js**: v22.x or v24.x (Native `node:sqlite` requires Node 22+)
- **npm**: v10+

### Step 1: Clone or Navigate to Directory
```bash
cd news-engagement-analytics
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Seed Database (Optional - Pre-seeded on first run)
```bash
cd backend
npm run seed
```

### Step 4: Run the Application

In **Terminal 1** (Start Backend on Port 5000):
```bash
cd backend
npm start
```

In **Terminal 2** (Start Frontend on Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

### Step 5: Run Automated Tests
```bash
cd backend
npm test
```
