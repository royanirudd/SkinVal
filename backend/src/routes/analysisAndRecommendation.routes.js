const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const AnalysisAndRecommendationController = require('../controllers/analysisAndRecommendation.controller');

// Route for analyzing multiple images and getting recommendations
router.post('/analyze',
	upload.fields([
		{ name: 'image_left', maxCount: 1 },
		{ name: 'image_front', maxCount: 1 },
		{ name: 'image_right', maxCount: 1 }
	]),
	AnalysisAndRecommendationController.analyzeAndRecommend
);

// Route for checking service status
router.get('/status',
	AnalysisAndRecommendationController.getStatus
);

router.get('/ai-results/:analysisId',
	AnalysisAndRecommendationController.getAIResults
);

module.exports = router;
