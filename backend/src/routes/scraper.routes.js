const express = require('express');
const router = express.Router();
const ScraperController = require('../controllers/scraper.controller');

router.post('/scrape', ScraperController.scrape);
router.get('/status', ScraperController.getStatus);

module.exports = router;
