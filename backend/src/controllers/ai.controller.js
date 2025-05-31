const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

async function generateSkincareRoutine(req, res, next) {
	try {
		const analysisData = req.body;
		const routine = await aiService.generateRoutine(analysisData);
		res.json({ success: true, data: routine });
	} catch (error) {
		logger.error('Error in AI controller:', error);
		next(error);
	}
}

async function getStatus(req, res, next) {
	try {
		const status = await aiService.getStatus();
		res.json({ success: true, data: status });
	} catch (error) {
		logger.error('Error checking AI service status:', error);
		next(error);
	}
}

module.exports = {
	generateSkincareRoutine,
	getStatus
};
