const FaceAnalyzer = require('./faceAnalyzer/FaceAnalyzer.class');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class FaceAnalyzerService {
	constructor() {
		this.analyzer = new FaceAnalyzer();
		this.initialized = false;
	}

	async initialize() {
		if (!this.initialized) {
			try {
				await this.analyzer.loadModel();
				this.initialized = true;
				logger.info('Face analyzer service initialized');
			} catch (error) {
				logger.error('Failed to initialize face analyzer:', error);
				throw error;
			}
		}
	}

	async analyzeImage(imageBuffer) {
		try {
			await this.initialize();
			logger.info('Starting single image analysis');

			const analysis = await this.analyzer.analyzeImage(imageBuffer);
			return {
				success: true,
				data: analysis
			};
		} catch (error) {
			logger.error('Error in single image analysis:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	async analyzeMultipleImages(imageBuffers) {
		try {
			await this.initialize();

			// Track analyses for each position
			const analyses = {};
			const positions = Object.keys(imageBuffers);

			// Analyze each image
			for (const position of positions) {
				try {
					logger.info(`Analyzing ${position} image`);
					const analysis = await this.analyzer.analyzeImage(imageBuffers[position]);
					analyses[position] = analysis;
				} catch (error) {
					logger.error(`Error analyzing ${position} image:`, error);
					analyses[position] = { error: error.message };
				}
			}

			// Combine analyses
			return this.combineAnalyses(analyses);

		} catch (error) {
			logger.error('Error in multiple image analysis:', error);
			throw error;
		}
	}

	combineAnalyses(analyses) {
		try {
			// Get valid analyses
			const validAnalyses = Object.entries(analyses)
				.filter(([_, analysis]) => !analysis.error)
				.map(([position, analysis]) => ({ position, analysis }));

			if (validAnalyses.length === 0) {
				throw new Error("No valid analyses available");
			}

			// Initialize combined data structures
			const combinedData = {
				skin_tone: this.combineSkintoneAnalyses(validAnalyses),
				concerns: this.combineConcerns(validAnalyses),
				texture_analysis: this.combineTextureAnalyses(validAnalyses),
				regions: this.combineRegionAnalyses(validAnalyses),
				recommendations: this.combineRecommendations(validAnalyses),
				confidence: this.calculateOverallConfidence(validAnalyses),
				analysis_coverage: {
					total_images: Object.keys(analyses).length,
					successful_analyses: validAnalyses.length,
					positions_analyzed: validAnalyses.map(v => v.position)
				}
			};

			// Add position-specific insights
			combinedData.position_insights = this.generatePositionInsights(analyses);

			return combinedData;
		} catch (error) {
			logger.error('Error combining analyses:', error);
			throw error;
		}
	}

	combineSkintoneAnalyses(validAnalyses) {
		// Combine skin tone analyses with voting system
		const toneVotes = {};
		const undertoneVotes = {};

		validAnalyses.forEach(({ analysis }) => {
			const tone = analysis.skin_tone.main_tone;
			const undertone = analysis.skin_tone.undertone;

			toneVotes[tone] = (toneVotes[tone] || 0) + 1;
			undertoneVotes[undertone] = (undertoneVotes[undertone] || 0) + 1;
		});

		return {
			main_tone: Object.entries(toneVotes)
				.reduce((a, b) => (a[1] > b[1] ? a : b))[0],
			undertone: Object.entries(undertoneVotes)
				.reduce((a, b) => (a[1] > b[1] ? a : b))[0],
			confidence: Math.max(...Object.values(toneVotes)) / validAnalyses.length
		};
	}

	combineConcerns(validAnalyses) {
		// Combine concerns with confidence levels
		const allConcerns = {};

		validAnalyses.forEach(({ analysis }) => {
			Object.entries(analysis.concerns).forEach(([concern, value]) => {
				if (!allConcerns[concern]) {
					allConcerns[concern] = { count: 0, total: 0 };
				}
				if (value) {
					allConcerns[concern].count++;
				}
				allConcerns[concern].total++;
			});
		});

		// Convert to final format with confidence levels
		const finalConcerns = {};
		Object.entries(allConcerns).forEach(([concern, data]) => {
			const confidence = data.count / data.total;
			finalConcerns[concern] = {
				detected: confidence > 0.3, // Threshold for concern detection
				confidence: confidence
			};
		});

		return finalConcerns;
	}

	combineTextureAnalyses(validAnalyses) {
		// Average texture metrics across all analyses
		const combinedTexture = {
			uniformity: 0,
			roughness: 0,
			contrast: 0
		};

		validAnalyses.forEach(({ analysis }) => {
			Object.entries(analysis.texture_analysis || {}).forEach(([key, value]) => {
				combinedTexture[key] += value / validAnalyses.length;
			});
		});

		return combinedTexture;
	}

	combineRegionAnalyses(validAnalyses) {
		// Combine region-specific analyses
		const combinedRegions = {};

		validAnalyses.forEach(({ analysis, position }) => {
			Object.entries(analysis.regions || {}).forEach(([region, data]) => {
				if (!combinedRegions[region]) {
					combinedRegions[region] = {
						metrics: {},
						positions_analyzed: []
					};
				}

				// Combine metrics
				Object.entries(data.metrics || {}).forEach(([metric, value]) => {
					if (!combinedRegions[region].metrics[metric]) {
						combinedRegions[region].metrics[metric] = 0;
					}
					combinedRegions[region].metrics[metric] += value / validAnalyses.length;
				});

				combinedRegions[region].positions_analyzed.push(position);
			});
		});

		return combinedRegions;
	}

	combineRecommendations(validAnalyses) {
		// Combine and prioritize recommendations
		const recommendations = {
			ingredients: new Set(),
			product_types: new Set(),
			routines: new Set(),
			priorities: {}
		};

		validAnalyses.forEach(({ analysis }) => {
			const recs = analysis.recommendations;

			// Add unique recommendations
			recs.ingredients.forEach(i => recommendations.ingredients.add(i));
			recs.product_types.forEach(p => recommendations.product_types.add(p));
			recs.routines.forEach(r => recommendations.routines.add(r));

			// Track recommendation priorities
			[...recs.ingredients, ...recs.product_types].forEach(item => {
				recommendations.priorities[item] = (recommendations.priorities[item] || 0) + 1;
			});
		});

		// Convert sets to arrays and sort by priority
		return {
			ingredients: Array.from(recommendations.ingredients)
				.sort((a, b) => (recommendations.priorities[b] || 0) - (recommendations.priorities[a] || 0)),
			product_types: Array.from(recommendations.product_types)
				.sort((a, b) => (recommendations.priorities[b] || 0) - (recommendations.priorities[a] || 0)),
			routines: Array.from(recommendations.routines)
		};
	}

	calculateOverallConfidence(validAnalyses) {
		return {
			overall: validAnalyses.reduce((acc, { analysis }) =>
				acc + analysis.confidence.analysis_quality, 0) / validAnalyses.length,
			coverage: validAnalyses.length / 3, // Ratio of successful analyses
			position_specific: validAnalyses.reduce((acc, { position, analysis }) => {
				acc[position] = analysis.confidence.analysis_quality;
				return acc;
			}, {})
		};
	}

	generatePositionInsights(analyses) {
		const insights = {};

		Object.entries(analyses).forEach(([position, analysis]) => {
			if (!analysis.error) {
				insights[position] = {
					unique_features: this.extractUniqueFeatures(position, analysis),
					confidence: analysis.confidence.analysis_quality,
					primary_concerns: this.getPrimaryConcerns(analysis)
				};
			} else {
				insights[position] = {
					error: analysis.error,
					status: 'failed'
				};
			}
		});

		return insights;
	}

	extractUniqueFeatures(position, analysis) {
		// Extract position-specific features
		const features = new Set();

		switch (position) {
			case 'front':
				if (analysis.regions?.forehead) features.add('forehead_analysis');
				if (analysis.regions?.cheeks) features.add('symmetry_analysis');
				break;
			case 'left':
			case 'right':
				if (analysis.regions?.cheeks) features.add('side_profile_analysis');
				if (analysis.regions?.jawline) features.add('contour_analysis');
				break;
		}

		return Array.from(features);
	}

	getPrimaryConcerns(analysis) {
		return Object.entries(analysis.concerns)
			.filter(([_, value]) => value)
			.map(([concern]) => concern);
	}

	async getStatus() {
		try {
			return {
				initialized: this.initialized,
				modelLoaded: this.analyzer.modelLoaded,
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			logger.error('Error getting service status:', error);
			throw error;
		}
	}
}

const faceAnalyzerService = new FaceAnalyzerService();
module.exports = faceAnalyzerService;
