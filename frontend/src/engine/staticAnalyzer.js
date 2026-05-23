import { preprocessCode } from './preprocessor';
import { getLineNumber, getLinesAround } from './lineResolver';
import securityRules from './rules/securityRules';
import performanceRules from './rules/performanceRules';
import smellRules from './rules/smellRules';
import bestPracticeRules from './rules/bestPracticeRules';

const severityRank = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function includesLanguage(rule, language) {
  if (!rule.languages || rule.languages === 'all') {
    return true;
  }
  if (Array.isArray(rule.languages)) {
    return rule.languages.includes(language);
  }
  return false;
}

function ruleKeyword(ruleId) {
  const mapping = {
    sec_001: 'eval',
    sec_002: 'innerhtml',
    sec_003: 'document write',
    sec_004: 'localstorage',
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
    perf_007: 'settimeout',
    smell_001: 'catch',
    smell_002: 'parameters',
    smell_003: 'magic number',
    smell_004: 'todo',
    smell_005: 'callbacks',
    bp_001: 'var',
    bp_002: 'equality',
    bp_003: 'promise',
    bp_004: 'print',
    bp_005: 'mutable default',
  };

  return mapping[ruleId] || ruleId.replace(/_/g, ' ');
}

function createStaticScore(issues) {
  if (!issues.length) {
    return 100;
  }

  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === 'CRITICAL') return sum + 12;
    if (issue.severity === 'HIGH') return sum + 8;
    if (issue.severity === 'MEDIUM') return sum + 5;
    return sum + 2;
  }, 0);

  return Math.max(0, 100 - penalty);
}

function analyzeCode(code, language) {
  const processedCode = preprocessCode(code);
  const allRules = [...securityRules, ...performanceRules, ...smellRules, ...bestPracticeRules].filter((rule) => includesLanguage(rule, language));
  const issues = [];
  const seen = new Set();

  allRules.forEach((rule) => {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    regex.lastIndex = 0;
    let matchCount = 0;

    let match = regex.exec(processedCode);
    while (match) {
      const lineNumber = getLineNumber(code, match.index);
      const dedupeKey = `${rule.id}:${lineNumber}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        issues.push({
          id: `${rule.id}_line${lineNumber}_${Date.now()}_${matchCount}`,
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          line: lineNumber,
          codeContext: getLinesAround(code, lineNumber, 2),
          suggestedFix: rule.suggestedFix,
          impact: rule.impact || null,
          detectedBy: 'static',
        });
        matchCount += 1;
      }

      if (matchCount >= 3) {
        break;
      }

      regex.lastIndex = match.index + Math.max(match[0].length, 1);
      match = regex.exec(processedCode);
    }
  });

  issues.sort((left, right) => {
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }
    return left.line - right.line;
  });

  const grouped = issues.reduce(
    (accumulator, issue) => {
      if (issue.category === 'security') {
        accumulator.security.push(issue);
      } else if (issue.category === 'performance') {
        accumulator.performance.push(issue);
      } else if (issue.category === 'codeSmell' || issue.category === 'bestPractice') {
        accumulator.codeSmells.push(issue);
      } else if (issue.category === 'bug') {
        accumulator.bugs.push(issue);
      }
      return accumulator;
    },
    { bugs: [], security: [], performance: [], codeSmells: [] }
  );

  const flattenAll = [...grouped.bugs, ...grouped.security, ...grouped.performance, ...grouped.codeSmells].sort((left, right) => {
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }
    return left.line - right.line;
  });

  return {
    bugs: grouped.bugs,
    security: grouped.security,
    performance: grouped.performance,
    codeSmells: grouped.codeSmells,
    detectedBy: 'static',
    score: createStaticScore(flattenAll),
    summary: flattenAll.length > 0 ? `Static engine flagged ${flattenAll.length} issue${flattenAll.length === 1 ? '' : 's'}.` : 'Static engine did not detect obvious high-risk patterns.',
    timestamp: Date.now(),
  };
}

export { analyzeCode };
