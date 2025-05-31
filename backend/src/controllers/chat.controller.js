const chatService = require('../services/chat.service');
const logger = require('../utils/logger');

const handleChatMessage = async (req, res) => {
	try {
		const { message, sessionId, context, llm } = req.body;

		console.log('Received in chat controller:', {
			message,
			sessionId,
			llm,
			contextLength: context ? Object.keys(context).length : 0,
			routine: context?.routine?.substring(0, 100) + '...',
			productsCount: context?.products?.length,
			tipsLength: context?.tips?.length
		});

		if (!message) {
			return res.status(400).json({
				success: false,
				error: 'Message is required'
			});
		}

		const response = await chatService.processMessage(message, sessionId, context, llm);

		res.json({
			success: true,
			response: response.response
		});

	} catch (error) {
		logger.error('Chat error:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to process chat message'
		});
	}
};

const healthCheck = async (req, res) => {
	try {
		res.json({
			success: true,
			message: 'Chat service is running'
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: 'Chat service health check failed'
		});
	}
};

module.exports = {
	handleChatMessage,
	healthCheck
};
