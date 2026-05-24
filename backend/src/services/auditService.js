const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.log');

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

function recordEvent(event = {}) {
  ensureDataDir();
  const entry = Object.assign({ timestamp: Date.now() }, event || {});
  try {
    fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + '\n', 'utf8');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to write audit event', e && e.message ? e.message : e);
  }
  return entry;
}

function listEvents(limit = 200) {
  try {
    if (!fs.existsSync(AUDIT_FILE)) return [];
    const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const last = lines.slice(-limit);
    return last.map((l) => {
      try { return JSON.parse(l); } catch (e) { return { raw: l }; }
    }).reverse();
  } catch (e) {
    return [];
  }
}

module.exports = { recordEvent, listEvents };
