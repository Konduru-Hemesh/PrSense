const fileExtensionMap = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'cpp',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  php: 'php',
  rb: 'ruby',
  kt: 'kotlin',
  swift: 'swift',
  sql: 'sql',
  html: 'html',
  css: 'css',
  sh: 'shell',
  bash: 'shell',
  dart: 'dart',
  scala: 'scala',
  lua: 'lua',
  yaml: 'yaml',
  yml: 'yaml',
};

function inferLanguageFromFileName(fileName = '') {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return fileExtensionMap[extension] || null;
}

function scoreCandidate(code, regexList) {
  return regexList.reduce((score, regex) => score + (regex.test(code) ? 1 : 0), 0);
}

function inferLanguageFromCode(code = '') {
  const source = String(code || '');
  if (!source.trim()) {
    return null;
  }

  const candidates = [
    ['typescript', [
      /\binterface\s+\w+/,
      /\btype\s+\w+\s*=\s*/,
      /:\s*(string|number|boolean|Record<|Array<|Promise<)/,
      /\benum\s+\w+/,
    ]],
    ['python', [
      /\bdef\s+\w+\s*\(/,
      /\bimport\s+\w+/,
      /\bfrom\s+\w+\s+import\s+/,
      /if __name__ == ['"]__main__['"]:/,
    ]],
    ['java', [
      /\bpublic\s+class\s+\w+/,
      /System\.out\.println\(/,
      /\bimport\s+java\./,
      /\bprivate\s+(final\s+)?(String|int|boolean|List<)/,
    ]],
    ['cpp', [
      /#include\s*<[^>]+>/,
      /\bstd::\w+/,
      /\bcout\s*<</,
      /\bnamespace\s+std\b/,
    ]],
    ['csharp', [
      /using\s+System;/,
      /namespace\s+\w+/,
      /Console\.Write(Line|)/,
      /\bpublic\s+(sealed\s+)?class\s+\w+/,
    ]],
    ['go', [
      /\bpackage\s+main\b/,
      /\bfunc\s+main\s*\(/,
      /fmt\.Print(Line|f)\(/,
      /\bimport\s*\(/,
    ]],
    ['rust', [
      /\bfn\s+main\s*\(/,
      /\buse\s+\w+::/,
      /println!\(/,
      /\blet\s+mut\s+/,
    ]],
    ['php', [
      /<\?php/,
      /\becho\s+/,
      /\$\w+/,
      /->\w+/,
    ]],
    ['ruby', [
      /\bdef\s+\w+/,
      /\bend\b/,
      /\bputs\b/,
      /\bclass\s+\w+/,
    ]],
    ['sql', [
      /\bSELECT\b[\s\S]+\bFROM\b/i,
      /\bINSERT\b[\s\S]+\bINTO\b/i,
      /\bUPDATE\b[\s\S]+\bSET\b/i,
      /\bDELETE\b[\s\S]+\bFROM\b/i,
    ]],
    ['html', [
      /<html[\s>]/i,
      /<div[\s>]/i,
      /<!doctype html>/i,
      /<body[\s>]/i,
    ]],
    ['css', [
      /\.[\w-]+\s*\{/,
      /#[\w-]+\s*\{/,
      /@media\b/,
      /:\s*[^;{}]+;/,
    ]],
    ['shell', [
      /^#!/,
      /\becho\s+/,
      /\bexport\s+\w+=/,
      /\bif\s+\[\[?/,
    ]],
    ['javascript', [
      /\bfunction\s+\w+\s*\(/,
      /\bconst\s+\w+\s*=\s*(async\s*)?\(/,
      /\bconsole\./,
      /\b(document|window)\./,
    ]],
  ];

  let winner = null;
  let highestScore = 0;

  candidates.forEach(([language, regexList]) => {
    const score = scoreCandidate(source, regexList);
    if (score > highestScore) {
      highestScore = score;
      winner = language;
    }
  });

  return highestScore >= 2 ? winner : null;
}

export {
  inferLanguageFromFileName,
  inferLanguageFromCode,
};
