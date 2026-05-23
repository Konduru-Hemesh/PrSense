const severityRank = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const categoryKeys = ['bugs', 'security', 'performance', 'codeSmells'];

function normalizeIssue(issue, detectedBy = 'ai') {
  if (!issue || typeof issue !== 'object') {
    return null;
  }

  return {
    ...issue,
    detectedBy: issue.detectedBy || detectedBy,
    line: Number.isFinite(issue.line) ? issue.line : null,
  };
}

function extractWordSequence(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function shareThreeConsecutiveWords(leftTitle, rightTitle) {
  const leftWords = extractWordSequence(leftTitle);
  const rightWords = extractWordSequence(rightTitle);

  for (let index = 0; index <= leftWords.length - 3; index += 1) {
    const phrase = leftWords.slice(index, index + 3).join(' ');
    if (phrase && rightWords.join(' ').includes(phrase)) {
      return true;
    }
  }

  return false;
}

function issueMatchesRuleKeyword(staticIssue, aiIssue) {
  if (!staticIssue?.ruleId || !aiIssue?.title) {
    return false;
  }

  const keywordMap = {
    sec_001: 'eval',
    sec_002: 'inner html',
    sec_003: 'document write',
    sec_004: 'local storage',
    sec_005: 'pickle',
    sec_006: 'shell',
    sec_007: 'sql',
    sec_008: 'secret',
    sec_009: 'exec',
    sec_010: 'ssl',
    perf_001: 'nested loop',
    perf_002: 'infinite loop',
    perf_003: 'dom query',
    perf_004: 'console',
    perf_005: 'sync fs',
    perf_006: 'render',
    perf_007: 'timeout',
    smell_001: 'catch',
    smell_002: 'parameter',
    smell_003: 'magic number',
    smell_004: 'todo',
    smell_005: 'callback',
    bp_001: 'var',
    bp_002: 'equality',
    bp_003: 'promise',
    bp_004: 'print',
    bp_005: 'mutable default',
  };

  const keyword = keywordMap[staticIssue.ruleId] || staticIssue.ruleId.replace(/_/g, ' ');
  return aiIssue.title.toLowerCase().includes(keyword.toLowerCase());
}

function isDuplicate(staticIssue, aiIssue) {
  if (!staticIssue || !aiIssue) {
    return false;
  }

  if (staticIssue.category !== aiIssue.category) {
    return false;
  }

  const staticLine = staticIssue.line || 0;
  const aiLine = aiIssue.line || 0;
  if (Math.abs(staticLine - aiLine) > 2) {
    return false;
  }

  return shareThreeConsecutiveWords(staticIssue.title, aiIssue.title) || issueMatchesRuleKeyword(staticIssue, aiIssue);
}

function severityScore(issues = []) {
  return issues.reduce((score, issue) => {
    if (issue.severity === 'CRITICAL') return score + 12;
    if (issue.severity === 'HIGH') return score + 8;
    if (issue.severity === 'MEDIUM') return score + 5;
    return score + 2;
  }, 0);
}

function mergeCategory(staticIssues = [], aiIssues = []) {
  const staticItems = staticIssues.map((issue) => normalizeIssue(issue, 'static')).filter(Boolean);
  const aiItems = aiIssues.map((issue) => normalizeIssue(issue, 'ai')).filter(Boolean);
  const merged = [];
  const usedAi = new Set();
  const bothIssues = [];

  staticItems.forEach((staticIssue) => {
    const matchingIndex = aiItems.findIndex((aiIssue, index) => !usedAi.has(index) && isDuplicate(staticIssue, aiIssue));

    if (matchingIndex >= 0) {
      const aiIssue = aiItems[matchingIndex];
      usedAi.add(matchingIndex);
      const mergedIssue = {
        ...aiIssue,
        description: aiIssue.description || staticIssue.description,
        suggestedFix: aiIssue.suggestedFix || staticIssue.suggestedFix,
        detectedBy: 'both',
        line: aiIssue.line ?? staticIssue.line,
      };
      merged.push(mergedIssue);
      bothIssues.push(mergedIssue);
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
    return (left.line || 0) - (right.line || 0);
  });

  return { merged, bothIssues };
}

function buildStaticOnlyResult(staticResult) {
  const categories = {
    bugs: [...(staticResult?.bugs || [])],
    security: [...(staticResult?.security || [])],
    performance: [...(staticResult?.performance || [])],
    codeSmells: [...(staticResult?.codeSmells || [])],
  };
  const allIssues = categoryKeys.flatMap((key) => categories[key]);
  const score = Math.max(0, 100 - severityScore(allIssues));

  return {
    bugs: categories.bugs,
    security: categories.security,
    performance: categories.performance,
    codeSmells: categories.codeSmells,
    score,
    summary: staticResult?.summary || (allIssues.length > 0 ? `Static engine flagged ${allIssues.length} issue${allIssues.length === 1 ? '' : 's'}.` : 'Static engine found no obvious issues.'),
    whatItDoes: staticResult?.summary || 'Static analysis completed without semantic context.',
    improvements: allIssues.slice(0, 4).map((issue) => issue.suggestedFix).filter(Boolean),
    timestamp: staticResult?.timestamp || Date.now(),
    detectedBy: 'static',
    totalIssues: allIssues.length,
    criticalCount: allIssues.filter((issue) => issue.severity === 'CRITICAL').length,
    hasSecurityIssues: categories.security.length > 0,
    staticOnlyCount: allIssues.length,
    aiOnlyCount: 0,
    bothCount: 0,
  };
}

export function mergeResults(staticResult, aiResult) {
  if (!aiResult) {
    return buildStaticOnlyResult(staticResult);
  }

  const normalizedAi = {
    score: Number.isFinite(aiResult.score) ? Math.max(0, Math.min(100, Math.round(aiResult.score))) : 75,
    summary: aiResult.summary || '',
    whatItDoes: aiResult.whatItDoes || '',
    improvements: Array.isArray(aiResult.improvements) ? aiResult.improvements.filter(Boolean) : [],
    bugs: Array.isArray(aiResult.bugs) ? aiResult.bugs.map((issue) => normalizeIssue(issue, 'ai')).filter(Boolean) : [],
    security: Array.isArray(aiResult.security) ? aiResult.security.map((issue) => normalizeIssue(issue, 'ai')).filter(Boolean) : [],
    performance: Array.isArray(aiResult.performance) ? aiResult.performance.map((issue) => normalizeIssue(issue, 'ai')).filter(Boolean) : [],
    codeSmells: Array.isArray(aiResult.codeSmells) ? aiResult.codeSmells.map((issue) => normalizeIssue(issue, 'ai')).filter(Boolean) : [],
  };

  const mergedCollections = {};
  const bothIssues = [];

  categoryKeys.forEach((key) => {
    const staticIssues = staticResult?.[key] || [];
    const aiIssues = normalizedAi[key] || [];
    const { merged, bothIssues: matched } = mergeCategory(staticIssues, aiIssues);
    mergedCollections[key] = merged;
    bothIssues.push(...matched);
  });

  const aiIssueIds = new Set([
    ...normalizedAi.bugs,
    ...normalizedAi.security,
    ...normalizedAi.performance,
    ...normalizedAi.codeSmells,
  ].map((issue) => issue.id));

  const staticCriticalNotInAi = [
    ...(staticResult?.bugs || []),
    ...(staticResult?.security || []),
    ...(staticResult?.performance || []),
    ...(staticResult?.codeSmells || []),
  ].filter((staticIssue) => staticIssue.severity === 'CRITICAL' && ![...normalizedAi.bugs, ...normalizedAi.security, ...normalizedAi.performance, ...normalizedAi.codeSmells].some((aiIssue) => isDuplicate(staticIssue, aiIssue)) && !aiIssueIds.has(staticIssue.id));

  const baseScore = Number.isFinite(normalizedAi.score) ? normalizedAi.score : 75;
  const finalScore = Math.max(0, baseScore - staticCriticalNotInAi.length * 5);
  const allMerged = [...mergedCollections.bugs, ...mergedCollections.security, ...mergedCollections.performance, ...mergedCollections.codeSmells];
  const criticalCount = allMerged.filter((issue) => issue.severity === 'CRITICAL').length;

  return {
    bugs: mergedCollections.bugs,
    security: mergedCollections.security,
    performance: mergedCollections.performance,
    codeSmells: mergedCollections.codeSmells,
    score: finalScore,
    summary: normalizedAi.summary || staticResult?.summary || '',
    whatItDoes: normalizedAi.whatItDoes || staticResult?.summary || '',
    improvements: normalizedAi.improvements.length > 0 ? normalizedAi.improvements : allMerged.slice(0, 4).map((issue) => issue.suggestedFix).filter(Boolean),
    timestamp: Date.now(),
    detectedBy: 'both',
    totalIssues: allMerged.length,
    criticalCount,
    hasSecurityIssues: mergedCollections.security.length > 0,
    staticOnlyCount: allMerged.filter((issue) => issue.detectedBy === 'static').length,
    aiOnlyCount: allMerged.filter((issue) => issue.detectedBy === 'ai').length,
    bothCount: allMerged.filter((issue) => issue.detectedBy === 'both').length,
  };
}
