const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/generate-routine', aiController.generateSkincareRoutine);
router.get('/status', aiController.getStatus);

module.exports = router;
