const express = require('express');
const router = express.Router();
const { FaceAnalyzerController, uploadMiddleware } = require('../controllers/faceAnalyzer.controller');

// Define routes
router.post('/analyze', uploadMiddleware, FaceAnalyzerController.analyzeFace);
router.get('/status', FaceAnalyzerController.getStatus);

module.exports = router;
