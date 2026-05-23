function padWithSpaces(text) {
  return text.replace(/[^\n]/g, ' ');
}

function preprocessCode(code) {
  const source = String(code || '');
  const withoutComments = source
    .replace(/\/\/[^\n]*/g, (match) => padWithSpaces(match))
    .replace(/\/\*[\s\S]*?\*\//g, (match) => padWithSpaces(match));

  return withoutComments.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, (match) => ' '.repeat(match.length));
}

export { preprocessCode };
