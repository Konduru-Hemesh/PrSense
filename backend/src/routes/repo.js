const express = require('express');
const { analyzeRepository } = require('../controllers/repoController');
const { validateRepoRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post('/analyze-repo', validateRepoRequest, analyzeRepository);

module.exports = router;
