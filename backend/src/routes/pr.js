const express = require('express');
const { analyzePullRequest } = require('../controllers/prController');
const { validatePullRequestRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post('/analyze-pr', validatePullRequestRequest, analyzePullRequest);

module.exports = router;