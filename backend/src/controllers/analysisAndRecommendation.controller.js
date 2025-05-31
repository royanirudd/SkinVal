const analysisAndRecommendationService = require('../services/analysisAndRecommendation.service');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class AnalysisAndRecommendationController {
	static async analyzeAndRecommend(req, res, next) {
		try {
			// Handle multiple files
			const files = {
				left: req.files?.['image_left']?.[0],
				front: req.files?.['image_front']?.[0],
				right: req.files?.['image_right']?.[0]
			};

			const uploadedFiles = Object.values(files).filter(Boolean);

			if (uploadedFiles.length === 0) {
				throw new AppError(400, 'No image files provided');
			}

			const priceRange = req.body.priceRange || 'all';
			logger.info(`Received analysis request with ${uploadedFiles.length} images and price range: ${priceRange}`);

			// Convert files to buffer objects
			const imageBuffers = {};
			Object.entries(files).forEach(([position, file]) => {
				if (file) {
					imageBuffers[position] = file.buffer;
				}
			});

			// Get initial analysis and products
			const initialResult = await analysisAndRecommendationService.getInitialAnalysis(
				imageBuffers,
				priceRange
			);

			// Generate unique analysis ID
			const analysisId = Date.now().toString();

			// Store the analysis data for later AI processing
			global.pendingAnalyses = global.pendingAnalyses || {};
			global.pendingAnalyses[analysisId] = initialResult;

			// Send initial response
			res.json({
				success: true,
				type: 'initial',
				analysis: initialResult.analysis,
				recommendations: initialResult.recommendations,
				analysisId
			});

			// Trigger AI processing in background after sending response
			AnalysisAndRecommendationController.processAIResults(analysisId, initialResult).catch(error => {
				logger.error('Error in background AI processing:', error);
			});

		} catch (error) {
			logger.error('Error in analysis and recommendation:', error);
			next(error);
		}
	}
	static async processAIResults(analysisId, initialResult) {
		try {
			logger.info(`Starting AI processing for analysis ${analysisId}`);
			global.aiResults = global.aiResults || {};

			// Generate routine and tips in parallel
			const [routine, tips] = await Promise.all([
				analysisAndRecommendationService.generateRoutine(initialResult.analysis),
				analysisAndRecommendationService.generateProductTips(
					initialResult.recommendations,
					initialResult.analysis.concerns
				)
			]);

			// Store results
			global.aiResults[analysisId] = { routine, tips };
			logger.info(`AI processing completed for analysis ${analysisId}`);

			// Clean up pending analysis
			delete global.pendingAnalyses[analysisId];

		} catch (error) {
			logger.error('Error processing AI results:', error);
			// Store error in results
			global.aiResults[analysisId] = { error: error.message };
		}
	}

	static async getAIResults(req, res, next) {
		try {
			const { analysisId } = req.params;
			const results = global.aiResults?.[analysisId];

			if (!results) {
				res.json({
					success: true,
					complete: false,
					message: 'Processing...'
				});
				return;
			}

			if (results.error) {
				res.json({
					success: false,
					complete: true,
					error: results.error
				});
				return;
			}

			res.json({
				success: true,
				complete: true,
				routine: results.routine,
				tips: results.tips?.tips || results.tips
			});

		} catch (error) {
			logger.error('Error fetching AI results:', error);
			next(error);
		}
	}

	static async getStatus(req, res, next) {
		try {
			const status = await analysisAndRecommendationService.getStatus();
			res.status(200).json(status);
		} catch (error) {
			logger.error('Error checking service status:', error);
			next(error);
		}
	}
}

module.exports = AnalysisAndRecommendationController;
