const express = require('express');
const { analyze, explain } = require('../controllers/analyzeController');
const { validateAnalyzeRequest, validateExplainRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post('/analyze-code', validateAnalyzeRequest, analyze);
router.post('/explain-fix', validateExplainRequest, explain);

module.exports = router;
