const crypto = require('crypto');
const { enqueue } = require('../jobs/bullQueue');
const { recordEvent } = require('../services/auditService');

function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = `sha256=${hmac.digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch (e) {
    return false;
  }
}

async function handleGithubWebhook(req, res, next) {
  try {
    const raw = req.body; // Buffer because route should use express.raw when mounted
    const signature = req.get('x-hub-signature-256') || req.get('X-Hub-Signature-256');
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!verifySignature(raw, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.get('x-github-event') || req.get('X-GitHub-Event');
    const payload = JSON.parse(raw.toString('utf8'));

    // Only handle pull_request events for MVP
    if (event === 'pull_request') {
      const action = payload.action;
      const pr = payload.pull_request || {};
      const repo = payload.repository || {};

      if (['opened', 'synchronize', 'reopened'].includes(action)) {
        const owner = repo.owner?.login || repo.owner?.name || (repo.full_name || '').split('/')[0];
        const repository = repo.name || (repo.full_name || '').split('/')[1];
        const pullNumber = pr.number;

        if (owner && repository && Number.isFinite(pullNumber)) {
            recordEvent({ type: 'webhook.received', provider: 'github', owner, repo: repository, pullNumber, action: action });
            enqueue({ owner, repo: repository, pullNumber, analysisMode: 'deep-review' });
        }
      }
    }

    res.status(202).json({ received: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGithubWebhook,
};
