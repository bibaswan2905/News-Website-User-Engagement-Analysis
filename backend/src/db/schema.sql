-- News Website Analytics Schema

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  read_time_min INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  summary TEXT,
  tags TEXT
);

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_page TEXT NOT NULL,
  exit_page TEXT NOT NULL,
  duration INTEGER NOT NULL,
  bounce_status INTEGER NOT NULL,
  device_type TEXT NOT NULL,
  traffic_source TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS page_views (
  view_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  article_id INTEGER,
  page_url TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  time_spent INTEGER NOT NULL,
  scroll_depth_pct INTEGER NOT NULL,
  clicked_recommendation INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES user_sessions(session_id),
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE INDEX IF NOT EXISTS idx_pageviews_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_article ON page_views(article_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_device ON user_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
