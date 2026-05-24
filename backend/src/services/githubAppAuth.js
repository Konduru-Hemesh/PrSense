const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const GITHUB_API_BASE = 'https://api.github.com';

let cachedJwt = null;
let cachedJwtExp = 0;
const installationTokenCache = new Map(); // installationId -> { token, expiresAt }

function loadPrivateKey() {
  const keyPath = process.env.GITHUB_PRIVATE_KEY_PATH;
  const inline = process.env.GITHUB_PRIVATE_KEY;
  if (inline && inline.trim()) return inline;
  if (!keyPath) throw new Error('GITHUB_PRIVATE_KEY_PATH or GITHUB_PRIVATE_KEY must be set');
  const resolved = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath);
  return fs.readFileSync(resolved, 'utf8');
}

function getAppJwt() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && cachedJwtExp - 30 > now) {
    return cachedJwt;
  }

  const appId = process.env.GITHUB_APP_ID;
  if (!appId) throw new Error('GITHUB_APP_ID is not set');
  const privateKey = loadPrivateKey();

  const payload = {
    iat: now - 60,
    exp: now + (9 * 60), // 9 minutes
    iss: String(appId),
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  cachedJwt = token;
  cachedJwtExp = payload.exp;
  return token;
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`GitHub API error (${res.status}): ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function getInstallationIdForRepo(owner, repo) {
  const jwtToken = getAppJwt();
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/installation`;
  const result = await fetchJson(url, { headers: { Authorization: `Bearer ${jwtToken}`, Accept: 'application/vnd.github+json' } });
  return result.id;
}

async function createInstallationToken(installationId) {
  const jwtToken = getAppJwt();
  const url = `${GITHUB_API_BASE}/app/installations/${installationId}/access_tokens`;
  const result = await fetchJson(url, { method: 'POST', headers: { Authorization: `Bearer ${jwtToken}`, Accept: 'application/vnd.github+json' } });
  // result.token, result.expires_at
  const expiresAt = result.expires_at ? Date.parse(result.expires_at) : Date.now() + (60 * 60 * 1000);
  installationTokenCache.set(installationId, { token: result.token, expiresAt });
  return result.token;
}

async function getInstallationTokenForRepo(owner, repo) {
  const installationId = await getInstallationIdForRepo(owner, repo);
  const cached = installationTokenCache.get(installationId);
  if (cached && cached.expiresAt - 30000 > Date.now()) {
    return cached.token;
  }
  return createInstallationToken(installationId);
}

module.exports = {
  getInstallationTokenForRepo,
  // exported for testing/debug
  _getAppJwt: getAppJwt,
};
