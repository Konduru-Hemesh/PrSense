const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function defaultSettings() {
  return {
    global: {
      autoPostComments: true,
      commentThreshold: 0,
    },
    repos: {},
  };
}

function readSettings() {
  ensureDataDir();
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const init = defaultSettings();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(init, null, 2), 'utf8');
      return init;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return defaultSettings();
  }
}

function writeSettings(obj) {
  ensureDataDir();
  const toWrite = Object.assign(defaultSettings(), obj || {});
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(toWrite, null, 2), 'utf8');
  return toWrite;
}

function getSettingsForRepo(owner, repo) {
  const settings = readSettings();
  const repoKey = `${owner}/${repo}`;
  const repoSettings = settings.repos && settings.repos[repoKey] ? settings.repos[repoKey] : {};
  return Object.assign({}, settings.global || {}, repoSettings || {});
}

function setSettingsForRepo(owner, repo, partial) {
  const settings = readSettings();
  const repoKey = `${owner}/${repo}`;
  settings.repos = settings.repos || {};
  settings.repos[repoKey] = Object.assign({}, settings.repos[repoKey] || {}, partial || {});
  writeSettings(settings);
  return settings.repos[repoKey];
}

module.exports = {
  readSettings,
  writeSettings,
  getSettingsForRepo,
  setSettingsForRepo,
};
