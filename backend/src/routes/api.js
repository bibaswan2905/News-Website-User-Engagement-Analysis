import express from 'express';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/metrics', analyticsController.getMetrics);
router.get('/content-performance', analyticsController.getContentPerformance);
router.get('/user-navigation', analyticsController.getUserNavigation);
router.get('/recommendations', analyticsController.getRecommendations);
router.get('/heatmap', analyticsController.getHeatmap);
router.get('/articles/:id', analyticsController.getArticleDetail);
router.post('/simulate-event', analyticsController.simulateEvent);
router.post('/reset-data', analyticsController.resetData);

export default router;
