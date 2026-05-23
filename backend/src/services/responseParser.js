function stripCodeFences(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function parseJsonResponse(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty Gemini response');
  }

  const cleaned = stripCodeFences(text);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonText = firstBrace >= 0 && lastBrace >= 0 ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Unable to parse Gemini response as JSON: ${error.message}`);
  }
}

function normalizeIssue(issue, detectedBy = 'ai') {
  if (!issue || typeof issue !== 'object') {
    return null;
  }

  return {
    id: issue.id || `ai_issue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: issue.title || 'Untitled issue',
    description: issue.description || '',
    line: Number.isFinite(issue.line) ? issue.line : null,
    severity: issue.severity || 'MEDIUM',
    suggestedFix: issue.suggestedFix || '',
    impact: issue.impact || '',
    category: issue.category || 'codeSmell',
    detectedBy: issue.detectedBy || detectedBy,
    codeContext: issue.codeContext || '',
    ruleId: issue.ruleId || null,
  };
}

function normalizeAnalysisPayload(payload) {
  const safePayload = payload && typeof payload === 'object' ? payload : {};
  const normalizeList = (items) => (Array.isArray(items) ? items.map((item) => normalizeIssue(item)).filter(Boolean) : []);
  const normalizeStrings = (items) => (Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []);
  const normalizeSentenceList = (items) => (Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []);

  return {
    score: Number.isFinite(safePayload.score) ? Math.max(0, Math.min(100, Math.round(safePayload.score))) : 75,
    summary: typeof safePayload.summary === 'string' ? safePayload.summary : '',
    whatItDoes: typeof safePayload.whatItDoes === 'string' ? safePayload.whatItDoes : '',
    whatItDoesPoints: normalizeSentenceList(safePayload.whatItDoesPoints),
    improvements: normalizeStrings(safePayload.improvements),
    bugs: normalizeList(safePayload.bugs),
    security: normalizeList(safePayload.security),
    performance: normalizeList(safePayload.performance),
    codeSmells: normalizeList(safePayload.codeSmells),
  };
}

module.exports = {
  parseJsonResponse,
  normalizeAnalysisPayload,
  normalizeIssue,
};
