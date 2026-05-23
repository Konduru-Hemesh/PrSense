function getLineNumber(code, matchIndex) {
  return String(code || '').substring(0, matchIndex).split('\n').length;
}

function getLinesAround(code, lineNumber, context = 2) {
  const lines = String(code || '').split('\n');
  const start = Math.max(0, lineNumber - context - 1);
  const end = Math.min(lines.length, lineNumber + context);
  return lines.slice(start, end).join('\n');
}

export { getLineNumber, getLinesAround };
