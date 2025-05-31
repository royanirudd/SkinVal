const { GoogleGenerativeAI } = require('@google/generative-ai');
const { CohereClient } = require('cohere-ai');
const logger = require('../utils/logger');

class ChatService {
	constructor() {
		try {
			// Initialize Gemini
			this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
			this.geminiModel = this.genAI.getGenerativeModel({
				model: 'gemini-2.0-flash',
				generationConfig: {
					temperature: 0.7,
					topK: 40,
					topP: 0.95,
					maxOutputTokens: 2048,
				}
			});

			// Initialize Cohere with separate API key
			this.cohere = new CohereClient({
				token: process.env.COHERE_2
			});

			/* Comment out Claude for now
			this.claude = new Anthropic({
			    apiKey: process.env.CLAUDE_API_KEY,
			});
			*/

			this.conversations = new Map();
			this.contextWindow = 10;

			logger.info('ChatService initialized successfully');
		} catch (error) {
			logger.error('Error initializing ChatService:', error);
			throw error;
		}
	}

	async processMessage(message, sessionId, context, llm = 'gemini') {
		try {
			logger.info('Processing chat message:', { message, sessionId, llm });

			let history = this.conversations.get(sessionId) || [];
			const prompt = this.buildPrompt(message, context, history);

			let responseText;

			switch (llm) {
				case 'claude':
					try {
						// Return fallback message and switch to Gemini
						const geminiResult = await this.geminiModel.generateContent({
							contents: [{ parts: [{ text: prompt }] }]
						});
						responseText = {
							text: geminiResult.response.text(),
							source: 'gemini',
							fallback: true,
							fallbackMessage: "Claude is currently down, switched to Gemini"
						};
					} catch (claudeError) {
						logger.error('Claude/Gemini fallback error:', claudeError);
						throw new Error('Failed to get response from Claude/Gemini fallback');
					}
					break;

				case 'cohere':
					try {
						const response = await this.cohere.generate({
							model: 'command',
							prompt: prompt,
							max_tokens: 2048,
							temperature: 0.7,
							k: 0,
							stop_sequences: [],
							return_likelihoods: 'NONE',
							truncate: 'END'
						});

						if (!response.body || !response.body.generations || response.body.generations.length === 0) {
							throw new Error('Invalid response from Cohere');
						}

						responseText = {
							text: response.body.generations[0].text,
							source: 'cohere'
						};
					} catch (cohereError) {
						logger.error('Cohere API error:', cohereError);
						throw new Error('Failed to get response from Cohere');
					}
					break;

				default: // gemini
					try {
						const result = await this.geminiModel.generateContent({
							contents: [{ parts: [{ text: prompt }] }]
						});
						responseText = {
							text: result.response.text(),
							source: 'gemini'
						};
					} catch (geminiError) {
						logger.error('Gemini API error:', geminiError);
						throw new Error('Failed to get response from Gemini');
					}
			}

			history = this.updateHistory(history, message, responseText.text);
			this.conversations.set(sessionId, history);

			return {
				success: true,
				response: responseText
			};

		} catch (error) {
			logger.error('Chat service error:', error);
			throw error;
		}
	}

	buildPrompt(message, context, history) {
		try {
			console.log('Building prompt with context:', {
				hasRoutine: Boolean(context?.routine),
				routineLength: context?.routine?.length,
				productsCount: context?.products?.length,
				productCategories: context?.products?.map(cat => cat.category),
				tipsLength: context?.tips?.length,
				historyLength: history?.length
			});

			const routineText = context?.routine || 'No routine provided';
			const productsText = context?.products?.length
				? context.products
					.map(category => {
						const productDetails = category.products
							.filter(p => p && p.title)
							.map(p => {
								const details = [p.title];

								if (p.price && !isNaN(p.price) && p.price !== 'null' && p.price !== null) {
									details.push(`Price: $${parseFloat(p.price).toFixed(2)}`);
								}

								if (p.rating && !isNaN(p.rating) && p.rating !== 'null' && p.rating !== null) {
									details.push(`Rating: ${parseFloat(p.rating).toFixed(1)}/5`);
								}

								return details.join(' - ');
							})
							.filter(detail => detail)
							.join('\n');
						return `${category.category}:\n${productDetails}`;
					})
					.filter(category => category)
					.join('\n\n')
				: 'No products available';

			// Convert history to a format that's easier to read in the prompt
			const formattedHistory = history
				.map(h => `${h.role.toUpperCase()}: ${h.content}`)
				.join('\n\n');

			const prompt = `You are a knowledgeable skincare expert assistant. Here is the context for this conversation:

CURRENT SKINCARE ROUTINE:
${routineText}

RECOMMENDED PRODUCTS:
${productsText}

ADDITIONAL TIPS:
${context?.tips || 'No additional tips provided.'}

PREVIOUS CONVERSATION:
${formattedHistory}

GUIDELINES:
- Provide clear, natural paragraphs without bullet points or markdown
- When discussing recommended products, use their exact names as listed
- Only mention price and ratings when explicitly provided
- Keep responses concise and directly address the question
- Use a conversational, professional tone
- You can discuss any skincare topics, ingredients, or general advice
- Feel free to explain skincare concepts and techniques
- Maintain a helpful, educational tone

USER QUESTION: ${message}`;

			logger.info('Built prompt with context:', {
				routineLength: routineText.length,
				productsLength: productsText.length,
				tipsLength: (context?.tips || '').length
			});

			return prompt;

		} catch (error) {
			logger.error('Error building prompt:', error);
			return `You are a skincare expert. The user asks: ${message}`;
		}
	}

	updateHistory(history, message, response) {
		history.push(
			{ role: 'user', content: message },
			{ role: 'assistant', content: response }
		);

		if (history.length > this.contextWindow * 2) {
			history = history.slice(-this.contextWindow * 2);
		}

		return history;
	}
}

const chatService = new ChatService();
module.exports = chatService;

