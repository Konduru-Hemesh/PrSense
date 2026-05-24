const express = require('express');
const { readSettings, writeSettings, getSettingsForRepo, setSettingsForRepo } = require('../services/settingsService');
const { recordEvent, listEvents } = require('../services/auditService');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/settings', (req, res) => {
  const settings = readSettings();
  res.json({ settings });
});

router.post('/settings', adminAuth, express.json(), (req, res) => {
  const payload = req.body || {};
  if (payload.owner && payload.repo) {
    const updated = setSettingsForRepo(payload.owner, payload.repo, payload.settings || {});
    recordEvent({ type: 'settings.update', repo: `${payload.owner}/${payload.repo}`, updated });
    return res.json({ updated });
  }

  const updated = writeSettings(payload);
  recordEvent({ type: 'settings.update', updated });
  return res.json({ updated });
});

router.get('/audit', (req, res) => {
  const limit = Number.parseInt(req.query.limit || '200', 10);
  const events = listEvents(limit);
  res.json({ events });
});

module.exports = router;
