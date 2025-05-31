const express = require('express');
const router = express.Router();
const analysisAndRecommendationRoutes = require('./analysisAndRecommendation.routes');
const faceAnalyzerRoutes = require('./faceAnalyzer.routes');
const scraperRoutes = require('./scraper.routes');
const aiRoutes = require('./ai.routes');
const chatRoutes = require('./chat.routes');

router.use('/face-analyzer', faceAnalyzerRoutes);
router.use('/scraper', scraperRoutes);
router.use('/analysis-recommendation', analysisAndRecommendationRoutes);
router.use('/ai', aiRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
