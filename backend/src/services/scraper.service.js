// scraper.service.js
const AmazonScraper = require('./scraper/AmazonScraper.class');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class ScraperService {
	constructor() {
		this.scraper = new AmazonScraper();
	}

	setPriceRange(range) {
		logger.info(`Setting price range to: ${range}`);
		this.scraper.setPriceRange(range);
	}

	async getStatus() {
		try {
			return {
				status: 'operational',
				message: 'Scraper service is running',
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			logger.error('Error checking scraper status:', error);
			throw new AppError(500, 'Error checking scraper status');
		}
	}

	generateSearchCategories(analysisResult) {
		const categories = [];

		// Skin tone based category
		if (analysisResult.skin_tone?.main_tone) {
			categories.push({
				category: `Skincare for ${analysisResult.skin_tone.main_tone} Skin`,
				terms: [analysisResult.skin_tone.main_tone.toLowerCase(), 'skincare']
			});
		}

		// Concern-based categories
		if (analysisResult.concerns) {
			if (analysisResult.concerns.acne) {
				categories.push({
					category: 'Acne Treatment',
					terms: ['acne', 'treatment', 'skincare']
				});
			}

			if (analysisResult.concerns.pigmentation) {
				categories.push({
					category: 'Dark Spot Treatment',
					terms: ['dark', 'spot', 'treatment', 'skincare']
				});
			}

			if (analysisResult.concerns.dark_circles) {
				categories.push({
					category: 'Under Eye Care',
					terms: ['dark', 'circles', 'eye', 'treatment']
				});
			}

			if (analysisResult.concerns.wrinkles) {
				categories.push({
					category: 'Anti-Aging Treatment',
					terms: ['anti', 'aging', 'wrinkle', 'treatment']
				});
			}

			if (analysisResult.concerns.dryness) {
				categories.push({
					category: 'Hydration Treatment',
					terms: ['hydrating', 'moisturizing', 'skincare']
				});
			}
		}

		// Add specialized treatments based on region analysis
		if (analysisResult.region_analyses) {
			const { forehead, cheeks, underEyes } = analysisResult.region_analyses;

			if (forehead?.texture.uniformity < 0.95) {
				categories.push({
					category: 'Forehead Care',
					terms: ['forehead', 'treatment', 'skincare']
				});
			}

			if (cheeks?.texture.contrast > 2) {
				categories.push({
					category: 'Pore Treatment',
					terms: ['pore', 'minimizing', 'treatment']
				});
			}

			if (underEyes?.stats.mean < 80) {
				categories.push({
					category: 'Eye Care',
					terms: ['eye', 'cream', 'dark', 'circles']
				});
			}
		}

		// Add specialized product types from recommendations
		if (analysisResult.recommendations?.product_types) {
			analysisResult.recommendations.product_types.forEach(type => {
				categories.push({
					category: `${type} Products`,
					terms: type.toLowerCase().split(' ')
				});
			});
		}

		// Add overall treatment category with combined concerns
		const overallTerms = [];
		if (analysisResult.concerns) {
			if (analysisResult.concerns.dryness) overallTerms.push('dry');
			if (analysisResult.concerns.acne) overallTerms.push('acne');
			if (analysisResult.concerns.dark_circles) overallTerms.push('dark', 'circles');
			if (analysisResult.concerns.pigmentation) overallTerms.push('dark', 'spots');
			if (analysisResult.concerns.wrinkles) overallTerms.push('anti', 'aging');
		}
		if (overallTerms.length) {
			categories.push({
				category: 'Overall Treatment',
				terms: [...overallTerms, 'skincare']
			});
		}

		logger.info(`Generated ${categories.length} search categories`);
		return categories;
	}

	async searchProducts(analysisResult) {
		try {
			this.scraper.recommendedProducts.clear();
			const searchCategories = this.generateSearchCategories(analysisResult);

			if (searchCategories.length === 0) {
				logger.warn('No search categories generated from analysis');
				return [];
			}

			logger.info('Starting concurrent product searches');
			const searchPromises = searchCategories.map(async category => {
				logger.info(`Searching products for category: ${category.category}`);
				try {
					const products = await this.scraper.searchProducts(category.terms);
					if (products.length > 0) {
						logger.info(`Found ${products.length} products for ${category.category}`);
						return {
							category: category.category,
							products: products
						};
					}
					logger.warn(`No products found for category: ${category.category}`);
					return null;
				} catch (error) {
					logger.error(`Error searching category ${category.category}:`, error);
					return null;
				}
			});

			const results = await Promise.all(searchPromises);
			const validResults = results.filter(result => result !== null);

			logger.info(`Completed all product searches. Found recommendations in ${validResults.length} categories`);
			return validResults;

		} catch (error) {
			logger.error('Error in product search:', error);
			throw new AppError(500, 'Error processing product search');
		}
	}
}

module.exports = new ScraperService();
