const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const faceAnalyzerService = require('../services/faceAnalyzer.service');
const multer = require('multer');
const upload = multer();

class FaceAnalyzerController {
	// Analyze multiple face images
	static async analyzeFace(req, res, next) {
		try {
			const files = {
				left: req.files?.['image_left']?.[0],
				front: req.files?.['image_front']?.[0],
				right: req.files?.['image_right']?.[0]
			};

			const uploadedFiles = Object.values(files).filter(Boolean);

			if (uploadedFiles.length === 0) {
				throw new AppError(400, 'No image files provided');
			}

			logger.info(`Processing face analysis request with ${uploadedFiles.length} images`);

			const imageBuffers = {};
			Object.entries(files).forEach(([position, file]) => {
				if (file) {
					imageBuffers[position] = file.buffer;
				}
			});

			const result = await faceAnalyzerService.analyzeMultipleImages(imageBuffers);
			res.status(200).json(result);
		} catch (error) {
			logger.error('Error in face analysis:', error);
			next(error);
		}
	}

	// Get service status
	static async getStatus(req, res, next) {
		try {
			const status = await faceAnalyzerService.getStatus();
			res.status(200).json({
				status: 'running',
				modelStatus: status
			});
		} catch (error) {
			logger.error('Error checking service status:', error);
			next(error);
		}
	}
}

// Configure multer for multiple file uploads
const uploadMiddleware = upload.fields([
	{ name: 'image_left', maxCount: 1 },
	{ name: 'image_front', maxCount: 1 },
	{ name: 'image_right', maxCount: 1 }
]);

module.exports = {
	FaceAnalyzerController,
	uploadMiddleware
};
