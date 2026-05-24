const GITHUB_API_BASE = 'https://api.github.com';

const { getInstallationTokenForRepo } = require('./githubAppAuth');

function baseHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'prsense-hackathon-app',
  };
}

async function apiFetch(url, opts = {}, owner, repo) {
  const headers = Object.assign({}, baseHeaders(), opts.headers || {});

  // If GITHUB_APP_ID configured, prefer installation token per-repo
  if (process.env.GITHUB_APP_ID && owner && repo) {
    try {
      const token = await getInstallationTokenForRepo(owner, repo);
      headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      // fallback to environment token
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
  } else if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, Object.assign({}, opts, { headers }));
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`GitHub API request failed (${response.status}): ${body.slice(0, 200)}`);
    error.status = response.status === 404 ? 404 : 502;
    throw error;
  }

  return response.json();
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

function parseGitHubRepoUrl(repoUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(repoUrl);
  } catch (error) {
    const invalidError = new Error('Invalid GitHub repository URL');
    invalidError.status = 400;
    throw invalidError;
  }

  const host = parsedUrl.hostname.replace(/^www\./, '');
  if (host !== 'github.com') {
    const invalidError = new Error('Only public GitHub repository URLs are supported');
    invalidError.status = 400;
    throw invalidError;
  }

  const segments = parsedUrl.pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    const invalidError = new Error('GitHub repository URL must look like https://github.com/owner/repo');
    invalidError.status = 400;
    throw invalidError;
  }

  const owner = decodeURIComponent(segments[0]);
  const repo = decodeURIComponent(String(segments[1]).replace(/\.git$/i, ''));

  if (!owner || !repo) {
    const invalidError = new Error('Unable to extract owner and repo from the provided URL');
    invalidError.status = 400;
    throw invalidError;
  }

  return {
    owner,
    repo,
    apiBaseUrl: GITHUB_API_BASE,
    htmlUrl: `https://github.com/${owner}/${repo}`,
  };
}

async function fetchJson(url, owner, repo) {
  return apiFetch(url, {}, owner, repo);
}

async function fetchPullRequestMeta(owner, repo, pullNumber) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`;
  return fetchJson(url, owner, repo);
}

async function fetchPullRequestFiles(owner, repo, pullNumber) {
  const files = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/files?per_page=${perPage}&page=${page}`;
    const pageFiles = await fetchJson(url, owner, repo);

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

async function fetchRepositoryMeta(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  return fetchJson(url, owner, repo);
}

async function fetchRepositoryTree(owner, repo, branch) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const response = await fetchJson(url, owner, repo);
  return Array.isArray(response?.tree) ? response.tree : [];
}

function isIgnoredRepositoryPath(pathname = '') {
  return /(^|\/)(node_modules|dist|build|coverage|out|vendor|\.git|\.next|target)(\/|$)/i.test(pathname);
}

function isSupportedRepositoryFile(pathname = '') {
  const lower = pathname.toLowerCase();
  if (isIgnoredRepositoryPath(lower)) {
    return false;
  }

  return detectLanguage(lower) !== 'plaintext';
}

function decodeContent(content = '', encoding = 'base64') {
  if (!content) {
    return '';
  }

  if (encoding === 'base64') {
    return Buffer.from(String(content).replace(/\n/g, ''), 'base64').toString('utf8');
  }

  return String(content);
}

async function fetchRepositoryFile(owner, repo, filePath) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetchJson(url, owner, repo);

  if (Array.isArray(response)) {
    return null;
  }

  const text = response.content ? decodeContent(response.content, response.encoding) : '';
  return {
    filename: response.path || filePath,
    language: detectLanguage(response.path || filePath),
    status: 'present',
    additions: 0,
    deletions: 0,
    content: text.slice(0, 40000),
    size: response.size || text.length,
    sha: response.sha || null,
  };
}

async function fetchRepositoryFiles(owner, repo, tree) {
  const candidates = tree
    .filter((entry) => entry && entry.type === 'blob' && isSupportedRepositoryFile(entry.path))
    .filter((entry) => (Number.isFinite(entry.size) ? entry.size <= 120000 : true))
    .sort((left, right) => {
      const sizeDelta = (left.size || 0) - (right.size || 0);
      if (sizeDelta !== 0) {
        return sizeDelta;
      }
      return String(left.path).localeCompare(String(right.path));
    })
    .slice(0, 20);

  const files = [];
  for (const entry of candidates) {
    const file = await fetchRepositoryFile(owner, repo, entry.path);
    if (file && file.content && file.content.trim()) {
      files.push(file);
    }
  }

  return files;
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

function buildRepositoryContexts(files, repository = {}) {
  return files.map((file) => ({
    filename: file.filename,
    language: file.language || detectLanguage(file.filename),
    status: file.status || 'present',
    additions: file.additions || 0,
    deletions: file.deletions || 0,
    size: file.size || 0,
    content: file.content || '',
    patch: file.content ? file.content.slice(0, 5000) : '',
    repository: {
      owner: repository.owner || '',
      repo: repository.repo || '',
      defaultBranch: repository.default_branch || repository.defaultBranch || '',
    },
  }));
}

module.exports = {
  parsePullRequestUrl,
  parseGitHubRepoUrl,
  fetchPullRequestMeta,
  fetchPullRequestFiles,
  fetchRepositoryMeta,
  fetchRepositoryTree,
  fetchRepositoryFiles,
  buildPatchContexts,
  detectLanguage,
  buildRepositoryContexts,
};

async function postCheckRun(owner, repo, headSha, name = 'PRSense', summary = '', conclusion = 'neutral') {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/check-runs`;
  const body = {
    name,
    head_sha: headSha,
    status: 'completed',
    conclusion,
    output: {
      title: name,
      summary,
    },
  };
  return apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, owner, repo);
}

async function createPRComment(owner, repo, pullNumber, bodyText, path, line, commitId, position) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/comments`;
  const body = {
    body: bodyText,
    commit_id: commitId,
    path: path,
  };

  // prefer `position` (diff index) when available since it's more reliable
  if (Number.isFinite(position) && position > 0) {
    body.position = position;
  } else if (Number.isFinite(line) && line > 0) {
    body.line = line;
  }

  return apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, owner, repo);
}

module.exports = Object.assign(module.exports, { postCheckRun, createPRComment });
