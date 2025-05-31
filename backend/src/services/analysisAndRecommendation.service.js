const faceAnalyzerService = require('./faceAnalyzer.service');
const scraperService = require('./scraper.service');
const aiService = require('./ai.service');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class AnalysisAndRecommendationService {
	async getInitialAnalysis(imageBuffers, priceRange = 'all') {
		try {
			// Set price range before analysis
			logger.info(`Setting price range to: ${priceRange}`);
			scraperService.setPriceRange(priceRange);

			// Step 1: Analyze faces from multiple angles
			logger.info('Starting face analysis for multiple images');
			const analyses = {};

			for (const [position, buffer] of Object.entries(imageBuffers)) {
				if (buffer) {
					logger.info(`Analyzing ${position} image`);
					const result = await faceAnalyzerService.analyzeImage(buffer);

					if (!result.success) {
						logger.error(`Face analysis failed for ${position} image`);
						continue;
					}

					analyses[position] = result.data;
				}
			}

			if (Object.keys(analyses).length === 0) {
				throw new AppError(400, 'Face analysis failed for all images');
			}

			// Combine analyses from different angles
			const combinedAnalysis = this.combineAnalyses(analyses);

			// Log the combined analysis
			logger.info('Combined face analysis result:');
			logger.info(JSON.stringify(combinedAnalysis, null, 2));

			// Step 2: Get product recommendations
			logger.info('Getting product recommendations');
			const recommendations = await scraperService.searchProducts(combinedAnalysis);

			const initialResult = {
				success: true,
				timestamp: new Date().toISOString(),
				analysis: combinedAnalysis,
				recommendations: recommendations,
				ai_provider: process.env.AI_SERVICE_PROVIDER
			};

			logger.info('Initial analysis result:');
			logger.info(JSON.stringify(initialResult, null, 2));

			return initialResult;

		} catch (error) {
			logger.error('Error in initial analysis:', error);
			logger.error('Full error:', error);
			throw new AppError(500, error.message);
		}
	}

	combineAnalyses(analyses) {
		try {
			logger.info('Combining analyses from multiple angles');

			// Initialize combined result
			const combined = {
				skin_tone: {},
				concerns: {},
				features: {}
			};

			// Count occurrences of each value
			const valueCounts = {
				skin_tone: {},
				concerns: {},
				features: {}
			};

			// Combine data from all angles
			Object.values(analyses).forEach(analysis => {
				// Combine skin tone
				if (analysis.skin_tone) {
					Object.entries(analysis.skin_tone).forEach(([key, value]) => {
						valueCounts.skin_tone[key] = valueCounts.skin_tone[key] || {};
						valueCounts.skin_tone[key][value] = (valueCounts.skin_tone[key][value] || 0) + 1;
					});
				}

				// Combine concerns
				if (analysis.concerns) {
					Object.entries(analysis.concerns).forEach(([key, value]) => {
						valueCounts.concerns[key] = valueCounts.concerns[key] || {};
						valueCounts.concerns[key][value] = (valueCounts.concerns[key][value] || 0) + 1;
					});
				}

				// Combine features
				if (analysis.features) {
					Object.entries(analysis.features).forEach(([key, value]) => {
						valueCounts.features[key] = valueCounts.features[key] || {};
						valueCounts.features[key][value] = (valueCounts.features[key][value] || 0) + 1;
					});
				}
			});

			// Select most common values
			['skin_tone', 'concerns', 'features'].forEach(category => {
				Object.keys(valueCounts[category]).forEach(key => {
					const counts = valueCounts[category][key];
					const mostCommon = Object.entries(counts)
						.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
					combined[category][key] = mostCommon;
				});
			});

			logger.info('Combined analysis:', combined);
			return combined;

		} catch (error) {
			logger.error('Error combining analyses:', error);
			throw new AppError(500, 'Failed to combine analyses from multiple angles');
		}
	}

	// Rest of the methods remain the same
	async generateRoutine(analysisData) {
		try {
			logger.info('Generating skincare routine');
			logger.info('Analysis data being sent to AI:');
			logger.info(JSON.stringify(analysisData, null, 2));

			const routine = await aiService.generateRoutine(analysisData);

			if (!routine) {
				throw new AppError(500, 'Failed to generate skincare routine');
			}

			logger.info('Generated routine successfully');
			return routine;

		} catch (error) {
			logger.error('Error generating routine:', error);
			logger.error('Analysis data that caused failure:', JSON.stringify(analysisData, null, 2));
			throw new AppError(500, 'Failed to generate skincare routine');
		}
	}

	async generateProductTips(recommendations, concerns) {
		try {
			logger.info('Generating product-specific tips');
			const tipsResult = await aiService.generateProductTips(recommendations, concerns);
			return tipsResult;
		} catch (error) {
			logger.error('Error generating product tips:', error);
			throw new AppError(500, 'Failed to generate product tips');
		}
	}

	async analyzeAndRecommend(imageBuffers, priceRange = 'all') {
		try {
			// Get initial analysis
			const initialResult = await this.getInitialAnalysis(imageBuffers, priceRange);

			// Generate routine
			let routine = null;
			try {
				routine = await this.generateRoutine(initialResult.analysis);
			} catch (error) {
				logger.error('Failed to generate skincare routine:', error);
			}

			const finalResult = {
				...initialResult,
				skincare_routine: routine
			};

			logger.info('Final result:');
			logger.info(JSON.stringify(finalResult, null, 2));

			return finalResult;

		} catch (error) {
			logger.error('Error in analysis and recommendation:', error);
			logger.error('Full error:', error);
			throw new AppError(500, error.message);
		}
	}

	async getStatus() {
		return {
			status: 'operational',
			message: 'Analysis and recommendation service is running',
			timestamp: new Date().toISOString()
		};
	}
}

module.exports = new AnalysisAndRecommendationService();
