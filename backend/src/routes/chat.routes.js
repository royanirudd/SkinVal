const express = require('express');
const router = express.Router();
const { handleChatMessage, healthCheck } = require('../controllers/chat.controller');

router.post('/message', handleChatMessage);
router.get('/health', healthCheck);

module.exports = router;
