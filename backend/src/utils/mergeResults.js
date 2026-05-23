const severityRank = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function normalizeIssue(issue, source = 'ai') {
  if (!issue || typeof issue !== 'object') {
    return null;
  }

  const categoryKey = issue.categoryKey || String(issue.category || '').toLowerCase().replace(/\s+/g, '');

  return {
    ...issue,
    detectedBy: issue.detectedBy || source,
    source: issue.source || (source === 'static' ? 'Static Engine' : 'AI Analysis'),
    categoryKey,
    file: issue.file || issue.filePath || 'Unknown file',
    filePath: issue.filePath || issue.file || 'Unknown file',
    line: Number.isFinite(issue.line) ? issue.line : null,
  };
}

function issueKey(issue) {
  return [issue.filePath, issue.line || 0, String(issue.title || '').toLowerCase()].join('|');
}

function mergeIssueLists(staticIssues = [], aiIssues = []) {
  const staticItems = staticIssues.map((issue) => normalizeIssue(issue, 'static')).filter(Boolean);
  const aiItems = aiIssues.map((issue) => normalizeIssue(issue, 'ai')).filter(Boolean);
  const merged = [];
  const usedAi = new Set();

  staticItems.forEach((staticIssue) => {
    const matchingIndex = aiItems.findIndex((aiIssue, index) => {
      if (usedAi.has(index)) {
        return false;
      }

      const sameFile = String(staticIssue.filePath || '').toLowerCase() === String(aiIssue.filePath || '').toLowerCase();
      const closeLine = Math.abs((staticIssue.line || 0) - (aiIssue.line || 0)) <= 2;
      const sameCategory = String(staticIssue.categoryKey || '').toLowerCase() === String(aiIssue.categoryKey || '').toLowerCase();
      const sameTitle = String(staticIssue.title || '').toLowerCase() === String(aiIssue.title || '').toLowerCase();
      return sameFile && closeLine && sameCategory && sameTitle;
    });

    if (matchingIndex >= 0) {
      usedAi.add(matchingIndex);
      const aiIssue = aiItems[matchingIndex];
      merged.push({
        ...staticIssue,
        ...aiIssue,
        detectedBy: 'both',
        source: 'Static Engine + AI Analysis',
        category: aiIssue.category || staticIssue.category,
        categoryKey: aiIssue.categoryKey || staticIssue.categoryKey,
        file: aiIssue.file || staticIssue.file,
        filePath: aiIssue.filePath || staticIssue.filePath,
        line: aiIssue.line ?? staticIssue.line,
        description: aiIssue.description || staticIssue.description,
        suggestion: aiIssue.suggestion || staticIssue.suggestion,
        impact: aiIssue.impact || staticIssue.impact,
      });
      return;
    }

    merged.push(staticIssue);
  });

  aiItems.forEach((aiIssue, index) => {
    if (!usedAi.has(index)) {
      merged.push(aiIssue);
    }
  });

  merged.sort((left, right) => {
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const categoryDelta = String(left.category || '').localeCompare(String(right.category || ''));
    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    const fileDelta = String(left.filePath || '').localeCompare(String(right.filePath || ''));
    if (fileDelta !== 0) {
      return fileDelta;
    }

    return (left.line || 0) - (right.line || 0);
  });

  return merged;
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

function buildFileSummaries(files = [], issues = []) {
  return files.map((file) => {
    const fileIssues = issues.filter((issue) => String(issue.filePath || '').toLowerCase() === String(file.filename || '').toLowerCase());
    return {
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch || '',
      language: file.language || 'plaintext',
      issues: fileIssues,
      issueCount: fileIssues.length,
      criticalCount: fileIssues.filter((issue) => issue.severity === 'CRITICAL').length,
      highCount: fileIssues.filter((issue) => issue.severity === 'HIGH').length,
      mediumCount: fileIssues.filter((issue) => issue.severity === 'MEDIUM').length,
      lowCount: fileIssues.filter((issue) => issue.severity === 'LOW').length,
    };
  });
}

function groupByCategory(issues = []) {
  return {
    bugs: issues.filter((issue) => issue.categoryKey === 'bug'),
    security: issues.filter((issue) => issue.categoryKey === 'security'),
    performance: issues.filter((issue) => issue.categoryKey === 'performance'),
    codeSmells: issues.filter((issue) => issue.categoryKey !== 'security' && issue.categoryKey !== 'performance' && issue.categoryKey !== 'bug'),
  };
}

function mergeResults(staticResult = {}, aiResult = {}, prMeta = {}, files = []) {
  const staticIssues = Array.isArray(staticResult.issues) ? staticResult.issues : [
    ...(staticResult.bugs || []),
    ...(staticResult.security || []),
    ...(staticResult.performance || []),
    ...(staticResult.codeSmells || []),
  ];

  const aiIssues = Array.isArray(aiResult.issues) ? aiResult.issues : [
    ...(aiResult.bugs || []),
    ...(aiResult.security || []),
    ...(aiResult.performance || []),
    ...(aiResult.codeSmells || []),
  ];

  const mergedIssues = mergeIssueLists(staticIssues, aiIssues);
  const grouped = groupByCategory(mergedIssues);
  const fileSummaries = buildFileSummaries(files, mergedIssues);

  const overallScore = Math.max(0, Math.min(100, Math.round(((Number(staticResult.score) || 100) * 0.35) + ((Number(aiResult.score) || 100) * 0.65) - mergedIssues.reduce((sum, issue) => sum + (issue.detectedBy === 'both' ? 0 : severityPenalty(issue.severity) * 0.25), 0))));
  const securityIssues = grouped.security;
  const maintainabilityIssues = [...grouped.performance, ...grouped.codeSmells];

  return {
    reviewType: 'github-pr',
    pr: prMeta,
    files: fileSummaries,
    issues: mergedIssues,
    bugs: grouped.bugs,
    security: grouped.security,
    performance: grouped.performance,
    codeSmells: grouped.codeSmells,
    score: overallScore,
    securityScore: scoreFromIssues(securityIssues),
    maintainabilityScore: scoreFromIssues(maintainabilityIssues),
    summary: aiResult.summary || staticResult.summary || 'Pull request review complete.',
    detectedBy: 'both',
    totalIssues: mergedIssues.length,
    criticalCount: mergedIssues.filter((issue) => issue.severity === 'CRITICAL').length,
    hasSecurityIssues: securityIssues.length > 0,
    staticOnlyCount: mergedIssues.filter((issue) => issue.detectedBy === 'static').length,
    aiOnlyCount: mergedIssues.filter((issue) => issue.detectedBy === 'ai').length,
    bothCount: mergedIssues.filter((issue) => issue.detectedBy === 'both').length,
    timestamp: Date.now(),
  };
}

module.exports = {
  mergeResults,
  normalizeIssue,
};