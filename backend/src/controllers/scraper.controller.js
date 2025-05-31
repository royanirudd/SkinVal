const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const scraperService = require('../services/scraper.service');

class ScraperController {
	static async scrape(req, res, next) {
		try {
			if (!req.body.analysis) {
				throw new AppError(400, 'Analysis results required');
			}

			logger.info('Starting product search based on analysis');
			const recommendations = await scraperService.searchProducts(req.body.analysis);

			res.status(200).json({
				success: true,
				recommendations,
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			logger.error('Error in scraping:', error);
			next(error);
		}
	}

	static async getStatus(req, res, next) {
		try {
			res.status(200).json({
				status: 'operational',
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			logger.error('Error checking scraper status:', error);
			next(error);
		}
	}
}

module.exports = ScraperController;
