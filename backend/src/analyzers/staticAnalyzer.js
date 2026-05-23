const severityRank = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const rules = [
  {
    id: 'sec_001',
    category: 'Security',
    categoryKey: 'security',
    severity: 'HIGH',
    title: 'Possible XSS vulnerability',
    description: 'This change writes directly to innerHTML, which can execute attacker-controlled markup.',
    suggestion: 'Use textContent or sanitize the value before rendering HTML.',
    impact: 'An attacker could inject script content into the page.',
    pattern: /innerHTML\s*=\s*/i,
  },
  {
    id: 'sec_002',
    category: 'Security',
    categoryKey: 'security',
    severity: 'CRITICAL',
    title: 'Dangerous eval usage',
    description: 'eval() executes arbitrary JavaScript and is rarely safe in production code.',
    suggestion: 'Replace eval() with explicit parsing or a safe lookup map.',
    impact: 'Arbitrary code execution becomes possible if input is influenced by users.',
    pattern: /\beval\s*\(/i,
  },
  {
    id: 'sec_003',
    category: 'Security',
    categoryKey: 'security',
    severity: 'HIGH',
    title: 'Potential local secret exposure',
    description: 'A token, secret, or password appears to be handled in code that may be committed or logged.',
    suggestion: 'Move secrets to environment variables and avoid logging them.',
    impact: 'Secrets can leak into the repository or application logs.',
    pattern: /(api[_-]?key|secret[_-]?key|password|token)\s*[:=]/i,
  },
  {
    id: 'sec_004',
    category: 'Security',
    categoryKey: 'security',
    severity: 'HIGH',
    title: 'Possible SQL injection risk',
    description: 'String concatenation is being used to construct a SQL query.',
    suggestion: 'Use parameterized queries or prepared statements.',
    impact: 'Attackers may be able to modify the query and access unauthorized data.',
    pattern: /(SELECT|INSERT|UPDATE|DELETE)[\s\S]*[+`].*(FROM|WHERE|VALUES)/i,
  },
  {
    id: 'sec_005',
    category: 'Security',
    categoryKey: 'security',
    severity: 'HIGH',
    title: 'Unsafe shell execution',
    description: 'The patch executes a shell command directly.',
    suggestion: 'Avoid shell execution or sanitize command arguments strictly.',
    impact: 'Command injection can lead to full system compromise.',
    pattern: /\b(os\.system|child_process\.(exec|execSync)|subprocess\.(call|run|Popen))\s*\(/i,
  },
  {
    id: 'perf_001',
    category: 'Performance',
    categoryKey: 'performance',
    severity: 'MEDIUM',
    title: 'Nested loop may be expensive',
    description: 'This change appears to introduce nested loops, which can grow quickly in cost.',
    suggestion: 'Cache repeated work or flatten the algorithm if possible.',
    impact: 'Performance may degrade noticeably as input size grows.',
    pattern: /for\s*\([^\n]*\)\s*\{[\s\S]*for\s*\(/i,
  },
  {
    id: 'perf_002',
    category: 'Performance',
    categoryKey: 'performance',
    severity: 'HIGH',
    title: 'Infinite loop risk',
    description: 'A loop appears to run forever or lacks a clear exit condition.',
    suggestion: 'Add a termination condition and verify loop progress.',
    impact: 'The UI or server can hang under load.',
    pattern: /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/i,
  },
  {
    id: 'perf_003',
    category: 'Performance',
    categoryKey: 'performance',
    severity: 'LOW',
    title: 'Repeated DOM queries',
    description: 'The code queries the DOM repeatedly in a way that could be cached.',
    suggestion: 'Store the element reference before repeated use.',
    impact: 'Minor but avoidable rendering overhead can accumulate.',
    pattern: /document\.(querySelector(All)?|getElementById)\s*\(/i,
  },
  {
    id: 'smell_001',
    category: 'Code Smells',
    categoryKey: 'codeSmells',
    severity: 'LOW',
    title: 'Console logging left in production code',
    description: 'A console.log statement is present in the diff.',
    suggestion: 'Remove debug logging or replace it with structured application logging.',
    impact: 'Logs can become noisy and leak implementation details.',
    pattern: /console\.log\s*\(/i,
  },
  {
    id: 'smell_002',
    category: 'Code Smells',
    categoryKey: 'codeSmells',
    severity: 'MEDIUM',
    title: 'Empty catch block',
    description: 'An empty catch block can swallow errors and hide failures.',
    suggestion: 'Handle the error or at least log and rethrow it.',
    impact: 'Silent failures are difficult to debug in production.',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/i,
  },
  {
    id: 'smell_003',
    category: 'Code Smells',
    categoryKey: 'codeSmells',
    severity: 'LOW',
    title: 'Too many parameters',
    description: 'The function signature appears to take too many arguments.',
    suggestion: 'Bundle related arguments into an object or dedicated parameter type.',
    impact: 'Large parameter lists are harder to read and maintain.',
    pattern: /function\s+\w+\s*\([^\)]{60,}\)/i,
  },
  {
    id: 'bp_001',
    category: 'Best Practices',
    categoryKey: 'codeSmells',
    severity: 'LOW',
    title: 'Use strict equality',
    description: 'Loose equality can produce surprising coercion behavior.',
    suggestion: 'Prefer === and !== unless coercion is intentional.',
    impact: 'Unexpected type coercion can create subtle bugs.',
    pattern: /[^=!]==[^=]/,
  },
  {
    id: 'bp_002',
    category: 'Best Practices',
    categoryKey: 'codeSmells',
    severity: 'LOW',
    title: 'Avoid var declarations',
    description: 'var is function-scoped and harder to reason about than let or const.',
    suggestion: 'Use let or const for block-scoped variables.',
    impact: 'Variable hoisting can create confusion and accidental reuse.',
    pattern: /\bvar\s+\w+/i,
  },
];

function getLineNumberFromPatch(patchLines, index) {
  let currentLine = null;
  let seen = 0;

  for (const patchLine of patchLines) {
    if (patchLine.type === 'hunk') {
      currentLine = patchLine.newStart;
      continue;
    }

    if (currentLine == null) {
      continue;
    }

    if (seen === index) {
      return currentLine;
    }

    seen += 1;
    if (patchLine.type !== 'removed') {
      currentLine += 1;
    }
  }

  return null;
}

function parsePatch(patch = '') {
  const lines = String(patch || '').split('\n');
  const parsed = [];

  lines.forEach((line) => {
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunkMatch) {
      parsed.push({ type: 'hunk', newStart: Number.parseInt(hunkMatch[1], 10), text: line });
      return;
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      parsed.push({ type: 'added', text: line.slice(1) });
      return;
    }

    if (line.startsWith(' ') || (!line.startsWith('-') && line.trim())) {
      parsed.push({ type: 'context', text: line.startsWith(' ') ? line.slice(1) : line });
      return;
    }

    if (line.startsWith('-') && !line.startsWith('---')) {
      parsed.push({ type: 'removed', text: line.slice(1) });
    }
  });

  return parsed;
}

function createIssue(rule, file, line, snippet) {
  return {
    id: `${rule.id}_${file.filename}_${line || 0}_${Math.random().toString(36).slice(2, 8)}`,
    source: 'Static Engine',
    detectedBy: 'static',
    category: rule.category,
    categoryKey: rule.categoryKey,
    severity: rule.severity,
    title: rule.title,
    description: rule.description,
    line,
    file: file.filename,
    filePath: file.filename,
    suggestion: rule.suggestion,
    impact: rule.impact,
    codeContext: snippet ? String(snippet).trim() : '',
    status: file.status,
  };
}

function analyzeFile(file) {
  const patch = String(file.patch || '');
  if (!patch.trim()) {
    return [];
  }

  const patchLines = parsePatch(patch);
  const issues = [];
  const seen = new Set();

  patchLines.forEach((patchLine, index) => {
    if (patchLine.type === 'hunk' || patchLine.type === 'removed') {
      return;
    }

    const content = patchLine.text || '';
    rules.forEach((rule) => {
      if (!rule.pattern.test(content)) {
        return;
      }

      const line = getLineNumberFromPatch(patchLines, index);
      const dedupeKey = `${file.filename}:${rule.id}:${line || 0}`;
      if (seen.has(dedupeKey)) {
        return;
      }
      seen.add(dedupeKey);

      issues.push(createIssue(rule, file, line, content));
    });
  });

  const joinedPatch = patchLines.map((item) => item.text).join('\n');
  if (/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{700,}?\}/i.test(joinedPatch)) {
    issues.push(createIssue({
      id: 'smell_large_function',
      category: 'Code Smells',
      categoryKey: 'codeSmells',
      severity: 'MEDIUM',
      title: 'Large function with multiple responsibilities',
      description: 'This function appears large and may be doing too much work in one place.',
      suggestion: 'Split the behavior into smaller, focused helper functions.',
      impact: 'Large functions are harder to test, reason about, and safely modify.',
    }, file, 1, 'Large function detected in patch context.'));
  }

  return issues;
}

function groupIssues(issues = []) {
  return issues.reduce((accumulator, issue) => {
    if (issue.categoryKey === 'security') {
      accumulator.security.push(issue);
    } else if (issue.categoryKey === 'performance') {
      accumulator.performance.push(issue);
    } else {
      accumulator.codeSmells.push(issue);
    }
    return accumulator;
  }, { security: [], performance: [], codeSmells: [] });
}

function severityPenalty(severity) {
  if (severity === 'CRITICAL') return 25;
  if (severity === 'HIGH') return 15;
  if (severity === 'MEDIUM') return 8;
  return 3;
}

function scoreFromIssues(issues = []) {
  return Math.max(0, 100 - issues.reduce((total, issue) => total + severityPenalty(issue.severity), 0));
}

function summarizeIssues(issues = []) {
  if (!issues.length) {
    return 'No obvious rule-based problems were detected in the changed patch.';
  }

  const critical = issues.filter((issue) => issue.severity === 'CRITICAL').length;
  const high = issues.filter((issue) => issue.severity === 'HIGH').length;
  return `${issues.length} issue${issues.length === 1 ? '' : 's'} found in the changed files (${critical} critical, ${high} high).`;
}

function analyzePullRequestFiles(files = []) {
  const allIssues = files.flatMap((file) => analyzeFile(file));
  const grouped = groupIssues(allIssues);
  const sortedIssues = [...allIssues].sort((left, right) => {
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const categoryDelta = String(left.category).localeCompare(String(right.category));
    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    const fileDelta = String(left.file || '').localeCompare(String(right.file || ''));
    if (fileDelta !== 0) {
      return fileDelta;
    }

    return (left.line || 0) - (right.line || 0);
  });

  return {
    issues: sortedIssues,
    security: grouped.security,
    performance: grouped.performance,
    codeSmells: grouped.codeSmells,
    bugs: [],
    score: scoreFromIssues(allIssues),
    securityScore: scoreFromIssues(grouped.security),
    maintainabilityScore: scoreFromIssues([...grouped.performance, ...grouped.codeSmells]),
    summary: summarizeIssues(allIssues),
    totalIssues: allIssues.length,
    criticalCount: allIssues.filter((issue) => issue.severity === 'CRITICAL').length,
    timestamp: Date.now(),
    detectedBy: 'static',
  };
}

module.exports = {
  analyzePullRequestFiles,
};