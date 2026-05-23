const GITHUB_API_BASE = 'https://api.github.com';

function buildHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'prsense-hackathon-app',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function parsePullRequestUrl(prUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(prUrl);
  } catch (error) {
    const invalidError = new Error('Invalid GitHub Pull Request URL');
    invalidError.status = 400;
    throw invalidError;
  }

  const host = parsedUrl.hostname.replace(/^www\./, '');
  if (host !== 'github.com') {
    const invalidError = new Error('Only public GitHub Pull Request URLs are supported');
    invalidError.status = 400;
    throw invalidError;
  }

  const segments = parsedUrl.pathname.split('/').filter(Boolean);
  if (segments.length < 4 || segments[2] !== 'pull') {
    const invalidError = new Error('GitHub Pull Request URL must look like https://github.com/owner/repo/pull/123');
    invalidError.status = 400;
    throw invalidError;
  }

  const owner = decodeURIComponent(segments[0]);
  const repo = decodeURIComponent(segments[1]);
  const pullNumber = Number.parseInt(segments[3], 10);

  if (!owner || !repo || !Number.isFinite(pullNumber)) {
    const invalidError = new Error('Unable to extract owner, repo, and pull request number from the provided URL');
    invalidError.status = 400;
    throw invalidError;
  }

  return {
    owner,
    repo,
    pullNumber,
    apiBaseUrl: GITHUB_API_BASE,
    htmlUrl: `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: buildHeaders() });
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`GitHub API request failed (${response.status}): ${body.slice(0, 200)}`);
    error.status = response.status === 404 ? 404 : 502;
    throw error;
  }

  return response.json();
}

async function fetchPullRequestMeta(owner, repo, pullNumber) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`;
  return fetchJson(url);
}

async function fetchPullRequestFiles(owner, repo, pullNumber) {
  const files = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/files?per_page=${perPage}&page=${page}`;
    const pageFiles = await fetchJson(url);

    if (!Array.isArray(pageFiles) || pageFiles.length === 0) {
      break;
    }

    files.push(...pageFiles);
    if (pageFiles.length < perPage) {
      break;
    }

    page += 1;
  }

  return files.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch || '',
    raw_url: file.raw_url || '',
    blob_url: file.blob_url || '',
    contents_url: file.contents_url || '',
  }));
}

function detectLanguage(filename = '') {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.java')) return 'java';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.rs')) return 'rust';
  if (lower.endsWith('.php')) return 'php';
  if (lower.endsWith('.rb')) return 'ruby';
  if (lower.endsWith('.cs')) return 'csharp';
  if (lower.endsWith('.kt') || lower.endsWith('.kts')) return 'kotlin';
  if (lower.endsWith('.swift')) return 'swift';
  if (lower.endsWith('.sql')) return 'sql';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
  if (lower.endsWith('.dart')) return 'dart';
  if (lower.endsWith('.scala')) return 'scala';
  if (lower.endsWith('.lua')) return 'lua';
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
  return 'plaintext';
}

function buildPatchContexts(files) {
  return files.map((file) => ({
    filename: file.filename,
    language: detectLanguage(file.filename),
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch,
  }));
}

module.exports = {
  parsePullRequestUrl,
  fetchPullRequestMeta,
  fetchPullRequestFiles,
  buildPatchContexts,
  detectLanguage,
};