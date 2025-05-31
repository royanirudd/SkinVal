const AIService = require('./ai/AI.class');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class AIRoutineService {
	async generateRoutine(analysisData) {
		try {
			logger.info(`Generating skincare routine with ${process.env.AI_SERVICE_PROVIDER}`);
			const routine = await AIService.generateSkincareRoutine(analysisData);
			return routine;
		} catch (error) {
			logger.error('Error generating skincare routine:', error);
			throw new AppError(500, error.message);
		}
	}

	async generateProductTips(categories, concerns) {
		try {
			logger.info('Generating product-specific tips');
			const tips = await AIService.generateProductTips(categories, concerns);
			return tips;
		} catch (error) {
			logger.error('Error generating product tips:', error);
			throw new AppError(500, error.message);
		}
	}

	async getStatus() {
		try {
			return {
				status: 'operational',
				provider: process.env.AI_SERVICE_PROVIDER,
				message: `${process.env.AI_SERVICE_PROVIDER} service is running`,
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			logger.error('Error checking AI service status:', error);
			throw new AppError(500, 'Error checking AI service status');
		}
	}
}

module.exports = new AIRoutineService();
