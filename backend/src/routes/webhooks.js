const express = require('express');
const { handleGithubWebhook } = require('../controllers/webhookController');

const router = express.Router();

// GitHub sends JSON but we need the raw body for HMAC verification
router.post('/github', express.raw({ type: 'application/json' }), handleGithubWebhook);

module.exports = router;
