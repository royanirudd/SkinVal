const tf = require('@tensorflow/tfjs-node');
const { createCanvas, loadImage } = require('canvas');
const logger = require('../../utils/logger');

class FaceAnalyzer {
	constructor() {
		this.model = null;
		this.modelLoaded = false;
		this.inputSize = {
			width: 128,
			height: 128
		};
		this.displaySize = {
			width: 512,
			height: 512
		};

		this.regions = {
			forehead: [0.3, 0.1, 0.7, 0.3],  // x1, y1, x2, y2
			cheeks: [0.2, 0.3, 0.8, 0.6],
			underEyes: [0.3, 0.25, 0.7, 0.35]
		};

		this.thresholds = {
			acne: 0.6,
			wrinkles: 0.4,
			pigmentation: 0.5,
			pores: 0.45,
			darkCircles: 0.55,
			dryness: 0.3
		};
	}

	async loadModel() {
		try {
			if (!this.modelLoaded) {
				logger.info('Loading face detection model...');

				// Use the specific model URL
				const modelUrl = 'https://storage.googleapis.com/tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1/model.json';

				this.model = await tf.loadGraphModel(modelUrl);

				// Warm up the model with a dummy tensor
				const dummyInput = tf.zeros([1, 128, 128, 3]);
				await this.model.predict(dummyInput).data();
				dummyInput.dispose();

				this.modelLoaded = true;
				logger.info('Face detection model loaded successfully');
			}
		} catch (error) {
			logger.error('Error loading face detection model:', error);

			// Try alternative URL if the first one fails
			try {
				logger.info('Attempting to load model from alternative source...');
				const alternativeUrl = 'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1';
				this.model = await tf.loadGraphModel(alternativeUrl, { fromTFHub: true });

				// Warm up the model
				const dummyInput = tf.zeros([1, 128, 128, 3]);
				await this.model.predict(dummyInput).data();
				dummyInput.dispose();

				this.modelLoaded = true;
				logger.info('Face detection model loaded successfully from alternative source');
			} catch (altError) {
				logger.error('Error loading model from alternative source:', altError);
				throw new Error(`Model loading failed: ${error.message}. Alternative loading also failed: ${altError.message}`);
			}
		}
	}

	async resizeImage(imageBuffer, targetSize) {
		const image = await loadImage(imageBuffer);
		const canvas = createCanvas(targetSize.width, targetSize.height);
		const ctx = canvas.getContext('2d');

		const scale = Math.min(
			targetSize.width / image.width,
			targetSize.height / image.height
		);
		const newWidth = image.width * scale;
		const newHeight = image.height * scale;

		const x = (targetSize.width - newWidth) / 2;
		const y = (targetSize.height - newHeight) / 2;

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, targetSize.width, targetSize.height);
		ctx.drawImage(image, x, y, newWidth, newHeight);

		return canvas;
	}

	async imageToTensor(canvas) {
		return tf.tidy(() => {
			const tensor = tf.browser.fromPixels(canvas)
				.expandDims(0)
				.toFloat()
				.div(255);
			return tensor;
		});
	}

	async detectFace(imageBuffer) {
		try {
			await this.loadModel();

			logger.info('Processing image for face detection...');
			const displayCanvas = await this.resizeImage(imageBuffer, this.displaySize);
			const modelCanvas = await this.resizeImage(imageBuffer, this.inputSize);

			let tensor = null;
			let result = null;
			let predictions = null;

			try {
				tensor = await this.imageToTensor(modelCanvas);
				logger.info('Image converted to tensor');

				if (!this.model) {
					throw new Error('Model not loaded properly');
				}

				result = await this.model.predict(tensor);
				predictions = await result.array();

				logger.info('Face detection completed');

				return {
					displayCanvas,
					predictions: predictions[0]
				};
			} finally {
				// Cleanup tensors
				if (tensor) tensor.dispose();
				if (result) result.dispose();
			}
		} catch (error) {
			logger.error('Face detection failed:', error);
			throw new Error(`Face detection failed: ${error.message}`);
		}
	}

	async analyzeTexture(canvas, regionCoords) {
		const ctx = canvas.getContext('2d');
		const [x1, y1, x2, y2] = regionCoords;
		const width = Math.floor((x2 - x1) * canvas.width);
		const height = Math.floor((y2 - y1) * canvas.height);
		const startX = Math.floor(x1 * canvas.width);
		const startY = Math.floor(y1 * canvas.height);

		const imageData = ctx.getImageData(startX, startY, width, height);
		const data = imageData.data;

		let contrast = 0;
		let roughness = 0;
		let uniformity = 0;

		for (let i = 0; i < data.length; i += 4) {
			if (i + 4 < data.length) {
				const currentPixel = (data[i] + data[i + 1] + data[i + 2]) / 3;
				const nextPixel = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
				contrast += Math.abs(currentPixel - nextPixel);
				roughness += Math.pow(currentPixel - nextPixel, 2);
			}
		}

		contrast = contrast / (data.length / 4);
		roughness = Math.sqrt(roughness / (data.length / 4));
		uniformity = 1 - (contrast / 255);

		return {
			contrast,
			roughness,
			uniformity
		};
	}

	async analyzeRegion(canvas, regionName, regionCoords) {
		const textureMetrics = await this.analyzeTexture(canvas, regionCoords);
		const ctx = canvas.getContext('2d');
		const imageData = ctx.getImageData(
			Math.floor(regionCoords[0] * canvas.width),
			Math.floor(regionCoords[1] * canvas.height),
			Math.floor((regionCoords[2] - regionCoords[0]) * canvas.width),
			Math.floor((regionCoords[3] - regionCoords[1]) * canvas.height)
		);
		const stats = this.calculateImageStats(imageData);

		return {
			regionName,
			texture: textureMetrics,
			stats
		};
	}

	calculateImageStats(imageData) {
		const data = imageData.data;
		let r = 0, g = 0, b = 0;
		const pixelCount = data.length / 4;

		for (let i = 0; i < data.length; i += 4) {
			r += data[i];
			g += data[i + 1];
			b += data[i + 2];
		}

		r = r / pixelCount;
		g = g / pixelCount;
		b = b / pixelCount;

		const brightness = (r + g + b) / 3;

		let variance = 0;
		for (let i = 0; i < data.length; i += 4) {
			const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
			variance += Math.pow(pixelBrightness - brightness, 2);
		}
		variance = variance / pixelCount;

		return {
			mean: brightness,
			std: Math.sqrt(variance),
			rgb: { r, g, b }
		};
	}

	determineSkinTone(stats) {
		let tone, undertone;
		const brightness = stats.mean;
		const rgbRatio = {
			rg: stats.rgb.r / stats.rgb.g,
			rb: stats.rgb.r / stats.rgb.b,
			gb: stats.rgb.g / stats.rgb.b
		};

		if (brightness > 170) {
			tone = "fair";
		} else if (brightness > 140) {
			tone = "medium";
		} else {
			tone = "dark";
		}

		if (rgbRatio.rg > 1.1 && rgbRatio.rb > 1.1) {
			undertone = "warm";
		} else if (rgbRatio.gb > 1.05) {
			undertone = "cool";
		} else {
			undertone = "neutral";
		}

		return {
			main_tone: tone,
			undertone: undertone,
			brightness: brightness,
			rgb_values: stats.rgb
		};
	}

	async analyzeMultipleImages(imageBuffers) {
		try {
			logger.info(`Starting analysis of ${imageBuffers.length} images`);

			const analyses = await Promise.all(
				imageBuffers.map(async (buffer, index) => {
					try {
						const position = ['left', 'front', 'right'][index];
						logger.info(`Analyzing ${position} image`);
						const analysis = await this.analyzeImage(buffer);
						return { position, analysis };
					} catch (error) {
						logger.error(`Error analyzing ${position} image:`, error);
						return { position, error: error.message };
					}
				})
			);

			// Combine analyses
			const combinedAnalysis = this.combineAnalyses(analyses);
			return combinedAnalysis;

		} catch (error) {
			logger.error('Multiple image analysis error:', error);
			throw new Error(`Multiple image analysis failed: ${error.message}`);
		}
	}

	combineAnalyses(analyses) {
		const validAnalyses = analyses.filter(a => !a.error);
		if (validAnalyses.length === 0) {
			throw new Error("No valid analyses available");
		}

		// Combine all concerns and recommendations
		const allConcerns = new Set();
		const combinedRecommendations = {
			ingredients: new Set(),
			product_types: new Set(),
			concerns: new Set(),
			routines: new Set()
		};

		// Track successful analyses for each position
		const positionResults = {};

		validAnalyses.forEach(({ position, analysis }) => {
			positionResults[position] = {
				skin_tone: analysis.skin_tone,
				concerns: analysis.concerns,
				confidence: analysis.confidence
			};

			// Combine concerns
			Object.entries(analysis.concerns).forEach(([concern, value]) => {
				if (value) allConcerns.add(concern);
			});

			// Combine recommendations
			Object.entries(analysis.recommendations).forEach(([key, values]) => {
				values.forEach(value => combinedRecommendations[key].add(value));
			});
		});

		// Convert Sets to Arrays in recommendations
		const finalRecommendations = {};
		Object.entries(combinedRecommendations).forEach(([key, set]) => {
			finalRecommendations[key] = Array.from(set);
		});

		return {
			analyses_by_position: positionResults,
			combined_concerns: Array.from(allConcerns),
			recommendations: finalRecommendations,
			analysis_count: validAnalyses.length,
			confidence: {
				overall: validAnalyses.reduce((acc, curr) =>
					acc + curr.analysis.confidence.analysis_quality, 0) / validAnalyses.length
			}
		};
	}

	async analyzeImage(imageBuffer) {
		try {
			logger.info('Starting face analysis process');

			const { displayCanvas, predictions } = await this.detectFace(imageBuffer);
			logger.info('Face detection completed', { predictions: predictions.length });

			if (!predictions || predictions.length === 0) {
				throw new Error("No face detected in the image");
			}

			// Analyze each region
			logger.info('Starting region analysis');
			const regionAnalyses = {};
			for (const [regionName, coords] of Object.entries(this.regions)) {
				regionAnalyses[regionName] = await this.analyzeRegion(displayCanvas, regionName, coords);
				logger.info(`Analyzed region: ${regionName}`);
			}

			// Overall skin analysis
			logger.info('Calculating overall skin analysis');
			const overallStats = this.calculateImageStats(
				displayCanvas.getContext('2d').getImageData(0, 0, displayCanvas.width, displayCanvas.height)
			);
			const skinTone = this.determineSkinTone(overallStats);
			logger.info('Skin tone analysis:', skinTone);

			// Detect concerns
			const concerns = {
				wrinkles: regionAnalyses.forehead.texture.uniformity < (1 - this.thresholds.wrinkles),
				dark_circles: regionAnalyses.underEyes.stats.mean < (regionAnalyses.cheeks.stats.mean * (1 - this.thresholds.darkCircles)),
				acne: regionAnalyses.cheeks.texture.contrast > this.thresholds.acne,
				pigmentation: Object.values(regionAnalyses).some(
					analysis => analysis.stats.std > (analysis.stats.mean * this.thresholds.pigmentation)
				),
				dryness: Object.values(regionAnalyses).some(
					analysis => analysis.texture.uniformity < this.thresholds.dryness
				)
			};
			logger.info('Detected concerns:', concerns);

			// Generate recommendations
			const recommendations = this.determineRecommendations(skinTone, regionAnalyses.cheeks.texture, concerns);
			logger.info('Generated recommendations');

			const finalAnalysis = {
				skin_tone: skinTone,
				region_analyses: regionAnalyses,
				concerns: concerns,
				recommendations: recommendations,
				confidence: {
					face_detection: predictions[0][0],
					analysis_quality: Math.min(1, (1 - overallStats.std / 255))
				}
			};

			logger.info('Complete analysis result:', {
				skin_tone: finalAnalysis.skin_tone,
				concerns: finalAnalysis.concerns,
				confidence: finalAnalysis.confidence
			});

			return finalAnalysis;

		} catch (error) {
			logger.error('Face analysis error:', error);
			throw new Error(`Face analysis failed: ${error.message}`);
		}
	}

	determineRecommendations(skinTone, texture, concerns) {
		const recommendations = {
			ingredients: new Set(),
			product_types: new Set(),
			concerns: new Set(),
			routines: new Set()
		};

		// Base routine
		recommendations.routines
			.add("Gentle Cleanser")
			.add("Moisturizer")
			.add("Sunscreen");

		// Skin tone recommendations
		if (skinTone.main_tone === "fair") {
			recommendations.ingredients
				.add("Niacinamide")
				.add("Vitamin C")
				.add("Zinc Oxide");
			recommendations.product_types.add("Mineral Sunscreen SPF 50+");
		} else if (skinTone.main_tone === "medium") {
			recommendations.ingredients
				.add("Hyaluronic Acid")
				.add("Peptides")
				.add("Vitamin E");
			recommendations.product_types.add("Hydrating Toner");
		} else {
			recommendations.ingredients
				.add("Kojic Acid")
				.add("Alpha Arbutin")
				.add("Vitamin C");
			recommendations.product_types.add("Brightening Serum");
		}

		// Concern-specific recommendations
		if (concerns.wrinkles) {
			recommendations.ingredients
				.add("Retinol")
				.add("Peptides")
				.add("Coenzyme Q10");
			recommendations.product_types
				.add("Anti-Aging Cream")
				.add("Night Cream");
			recommendations.concerns.add("Anti-Aging");
		}

		if (concerns.dark_circles) {
			recommendations.ingredients
				.add("Caffeine")
				.add("Vitamin K")
				.add("Hyaluronic Acid");
			recommendations.product_types.add("Eye Cream");
			recommendations.concerns.add("Dark Circles");
		}

		if (concerns.acne) {
			recommendations.ingredients
				.add("Salicylic Acid")
				.add("Benzoyl Peroxide")
				.add("Tea Tree Oil");
			recommendations.product_types
				.add("Spot Treatment")
				.add("Oil-Free Moisturizer");
			recommendations.concerns.add("Acne-Prone");
		}

		if (concerns.pigmentation) {
			recommendations.ingredients
				.add("Vitamin C")
				.add("Alpha Arbutin")
				.add("Tranexamic Acid");
			recommendations.product_types
				.add("Dark Spot Corrector")
				.add("Brightening Mask");
			recommendations.concerns.add("Hyperpigmentation");
		}

		if (concerns.dryness) {
			recommendations.ingredients
				.add("Hyaluronic Acid")
				.add("Ceramides")
				.add("Squalane");
			recommendations.product_types
				.add("Rich Moisturizer")
				.add("Hydrating Serum");
			recommendations.concerns.add("Dryness");
		}

		return {
			ingredients: Array.from(recommendations.ingredients),
			product_types: Array.from(recommendations.product_types),
			concerns: Array.from(recommendations.concerns),
			routines: Array.from(recommendations.routines)
		};
	}
}

module.exports = FaceAnalyzer;
