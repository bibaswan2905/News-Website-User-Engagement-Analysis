import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import './db/database.js'; // Ensure database is initialized

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API router
app.use('/api', apiRouter);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    name: 'News Website User Engagement Analytics API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/metrics',
      '/api/content-performance',
      '/api/user-navigation',
      '/api/recommendations',
      '/api/heatmap',
      '/api/articles/:id',
      '/api/simulate-event',
      '/api/reset-data'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  News Analytics Backend running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});

export default app;
