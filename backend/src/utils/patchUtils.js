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

function computePositionFromPatch(patch = '', targetLine) {
  if (!patch || !Number.isFinite(targetLine)) return null;
  const parsed = parsePatch(patch);
  let currentNewLine = null;
  let position = 0;

  for (const item of parsed) {
    if (item.type === 'hunk') {
      currentNewLine = item.newStart;
      continue;
    }

    // each non-hunk line occupies one position in the diff
    position += 1;

    if (currentNewLine != null && item.type !== 'removed') {
      if (currentNewLine === targetLine) {
        return position;
      }
      currentNewLine += 1;
    }
  }

  return null;
}

module.exports = { parsePatch, computePositionFromPatch };
