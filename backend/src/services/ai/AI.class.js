const { CohereClient } = require('cohere-ai');
const logger = require('../../utils/logger');

class AIService {
	constructor() {
		this.provider = 'cohere';
		this.cohere = new CohereClient({
			token: process.env.COHERE_API_KEY
		});

		logger.info('AI Service initialized:', {
			provider: this.provider
		});
	}

	async generateProductTips(categories, concerns) {
		try {
			logger.info('Generating product tips');

			const prompt = this.constructTipsPrompt(categories, concerns);
			logger.info('Generated tips prompt:', prompt);

			const response = await this.cohere.generate({
				model: 'command',
				prompt: prompt,
				max_tokens: 1000,
				temperature: 0.7,
				k: 0,
				stop_sequences: [],
				return_likelihoods: 'NONE',
				truncate: 'END'
			});

			if (!response.generations || response.generations.length === 0) {
				throw new Error('Invalid response from Cohere for tips');
			}

			return {
				tips: response.generations[0].text.trim(),
				source: 'cohere'
			};
		} catch (error) {
			logger.error('Error generating product tips:', error);
			throw error;
		}
	}

	constructTipsPrompt(categories, concerns) {
		const categoriesPrompt = categories.map(category => {
			const productNames = category.products
				.slice(0, 2) // Only use first 2 products for brevity
				.map(p => `"${p.title}"`)
				.join(' and ');

			return `${category.category}:
Products: ${productNames}
Related concern: ${concerns[category.category] || 'general skin health'}`
		}).join('\n\n');

		return `Generate specific skincare tips for each product category. For each category:
1. Mention 1-2 specific products by name from the list
2. Explain how they address the related concern
3. Keep each tip to 1-2 sentences maximum

Here are the categories and products:

${categoriesPrompt}

Format your response with category names as headers, followed by the tip on a new line. Separate each category with a blank line.`;
	}

	async generateSkincareRoutine(analysisData) {
		try {
			logger.info(`Generating skincare routine with ${this.provider}`);
			logger.info('Received analysis data for routine generation:', {
				skin_tone: analysisData.skin_tone,
				concerns: analysisData.concerns
			});

			if (!this.validateAnalysisData(analysisData)) {
				throw new Error('Invalid analysis data received');
			}

			const prompt = this.constructPrompt(analysisData);
			logger.info('Generated prompt:', prompt);

			const routine = await this.generateWithCohere(prompt);
			logger.info('Generated routine:', routine);
			return routine;

		} catch (error) {
			logger.error('Error in generateSkincareRoutine:', error);
			throw error;
		}
	}

	validateAnalysisData(data) {
		if (!data?.skin_tone?.main_tone || !data?.skin_tone?.undertone || !data?.concerns) {
			logger.error('Invalid analysis data structure:', data);
			return false;
		}
		return true;
	}


	constructPrompt(analysisData) {
		const concerns = Object.entries(analysisData.concerns)
			.filter(([_, value]) => value)
			.map(([key]) => key.replace('_', ' '))
			.join(', ');

		const recommendations = analysisData.recommendations?.ingredients?.join(', ') || '';

		return `Create a personalized skincare routine based on the following profile:

Skin Profile:
- Skin tone: ${analysisData.skin_tone.main_tone} with ${analysisData.skin_tone.undertone} undertone
- Skin concerns: ${concerns || 'general skin health'}
- Recommended ingredients: ${recommendations}

Please provide a detailed daily skincare routine that includes morning and evening routines.
Format the routine exactly as follows:

AM
[morning routine steps]

PM
[evening routine steps]

Important formatting rules:
1. Use exactly "AM" and "PM" as headers (no variations, no ###, no colons)
2. Put each step on a new line
3. Each step should start with a bullet point (•)
4. Keep the total routine between 7-10 steps
5. Do not include any introductory text before AM
6. Do not include any concluding remarks after the last step`;
	}

	async generateWithCohere(prompt) {
		try {
			logger.info('Generating with Cohere:', { prompt });

			const response = await this.cohere.generate({
				model: 'command',
				prompt: prompt,
				max_tokens: 800,
				temperature: 0.7,
				k: 0,
				stop_sequences: [],
				return_likelihoods: 'NONE',
				truncate: 'END'
			});

			logger.info('Cohere response:', response);

			if (!response.generations || response.generations.length === 0) {
				throw new Error('Invalid response from Cohere');
			}

			let routineText = response.generations[0].text.trim();

			// Split into lines and clean them
			const lines = routineText.split(/[\n\r]+/)
				.map(line => line.trim())
				.filter(line => line.length > 0)
				.filter(line => !line.toLowerCase().includes('here is'))
				.filter(line => !line.toLowerCase().includes('personalized'))
				.map(line => {
					// Remove numbers and common prefixes
					line = line.replace(/^\d+[\.\)]-?\s*/, '');
					line = line.replace(/^[A-Za-z]+\s*\d+[\.\)]-?\s*/, '');
					line = line.replace(/^###\s*/, '');
					line = line.replace(/^[AP]M:\s*/, '');
					return line;
				})
				.filter(line => line.length > 0);

			// Separate morning and evening routines
			let morningRoutine = [];
			let eveningRoutine = [];
			let currentRoutine = morningRoutine;

			// Process lines and categorize them
			lines.forEach(line => {
				if (line.includes('remove makeup') ||
					line.includes('second cleanse') ||
					line.includes('sleeping mask') ||
					line.includes('night cream')) {
					currentRoutine = eveningRoutine;
				}
				if (!line.match(/^(AM|PM)$/)) {
					currentRoutine.push('• ' + line.replace(/^[-•∙⚫●⏺️◆◇■□●○]\s*/, ''));
				}
			});

			// Ensure we have both routines
			if (morningRoutine.length === 0 || eveningRoutine.length === 0) {
				// Split existing steps between morning and evening if needed
				const allSteps = [...morningRoutine, ...eveningRoutine];
				const midPoint = Math.ceil(allSteps.length / 2);
				morningRoutine = allSteps.slice(0, midPoint);
				eveningRoutine = allSteps.slice(midPoint);
			}

			// Combine routines with headers
			const formattedRoutine = [
				'AM',
				...morningRoutine,
				'',  // Empty line between routines
				'PM',
				...eveningRoutine
			].join('\n');

			if (formattedRoutine.split('\n').length < 7) {
				throw new Error('Generated routine too short');
			}

			return {
				routine: formattedRoutine,
				source: 'cohere'
			};

		} catch (error) {
			logger.error('Cohere generation error:', error);
			throw error;
		}
	}
}

module.exports = new AIService();
