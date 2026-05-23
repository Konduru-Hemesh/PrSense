const smellRules = [
  {
    id: 'smell_001',
    category: 'codeSmell',
    severity: 'MEDIUM',
    title: 'Empty catch block silences errors',
    description: 'An empty catch block swallows exceptions entirely, making debugging impossible. Errors fail silently - the application continues in a broken state with no trace of what went wrong.',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    suggestedFix: 'At minimum, log the error: catch(err) { console.error(err); }. Better: handle it meaningfully or rethrow with context.',
  },
  {
    id: 'smell_002',
    category: 'codeSmell',
    severity: 'MEDIUM',
    title: 'Function has too many parameters',
    description: 'Functions with more than 4-5 parameters are hard to call correctly, hard to test, and signal the function is doing too much. Parameter order becomes a source of bugs.',
    pattern: /function\s+\w+\s*\([^)]{60,}\)|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]{60,}\)\s*=>/g,
    suggestedFix: 'Refactor to accept a single options/config object: function doThing({ name, age, role, permissions }) - this is self-documenting and order-independent.',
  },
  {
    id: 'smell_003',
    category: 'codeSmell',
    severity: 'LOW',
    title: 'Magic number in code',
    description: 'Unexplained numeric literals scattered through code are magic numbers. They have no semantic meaning to future readers and create fragile code where the same constant appears in multiple places that must all be updated together.',
    pattern: /(?<![.\w])\b(?!0|1|2|100|1000)\d{3,}\b(?!\s*[:%])/g,
    suggestedFix: 'Extract to a named constant: const MAX_RETRY_ATTEMPTS = 847; This makes intent clear and centralizes the value.',
  },
  {
    id: 'smell_004',
    category: 'codeSmell',
    severity: 'LOW',
    title: 'Unresolved TODO/FIXME comment',
    description: 'TODO and FIXME comments indicate known issues or incomplete implementations left in the code. They accumulate over time and often describe real bugs or missing functionality that never gets addressed.',
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|BUG|TEMP):/gi,
    suggestedFix: 'Convert to tracked issues in your issue tracker (GitHub Issues, Jira). Delete the comment and create a ticket with proper context, priority, and owner.',
  },
  {
    id: 'smell_005',
    category: 'codeSmell',
    severity: 'MEDIUM',
    title: 'Deeply nested callbacks detected',
    description: 'Three or more levels of nested callbacks create callback hell - code that is impossible to read, test, or maintain. Error handling becomes scattered and unpredictable.',
    pattern: /function[^{]*\{[^}]*function[^{]*\{[^}]*function[^{]*\{/gs,
    suggestedFix: 'Refactor using async/await with try/catch, or Promise chaining. Extract inner callbacks to named functions at the module level.',
  },
];

export default smellRules;
