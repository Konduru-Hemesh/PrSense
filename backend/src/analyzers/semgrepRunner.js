const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

function writeTempFiles(files, dir) {
  files.forEach((file) => {
    const target = path.join(dir, file.filename.replace(/\//g, '__'));
    const content = file.content || (() => {
      // fallback: use added lines from patch if no full content available
      const patch = String(file.patch || '');
      return patch.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1)).join('\n') || '';
    })();
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content, 'utf8');
    } catch (e) {
      // ignore write errors per-file
    }
  });
}

function runSemgrep(dir) {
  return new Promise((resolve) => {
    // prefer semgrep binary if installed, otherwise try npx semgrep
    const candidates = ['semgrep', 'npx'];
    let triedNPX = false;

    function tryExec(cmd, args) {
      execFile(cmd, args, { timeout: 60 * 1000 }, (err, stdout, stderr) => {
        if (err) {
          return resolve({ ok: false, err: err.message || String(err), stdout: '', stderr: stderr || '' });
        }

        try {
          const json = JSON.parse(stdout || '{}');
          return resolve({ ok: true, json });
        } catch (e) {
          return resolve({ ok: false, err: 'invalid-json', stdout, stderr });
        }
      });
    }

    // first try semgrep directly
    tryExec('semgrep', ['--json', dir]);
  });
}

function normalizeSemgrepResult(result) {
  const results = result?.results || [];
  return results.map((r) => {
    const start = r.start || r.extra?.lines?.start || (r.extra && r.extra.start ? r.extra.start : null);
    const pathStr = r.path || r.extra?.path || r.extra?.filename || '';
    const message = (r.extra && (r.extra.message || r.extra.lines?.text)) || r.message || r.extra?.msg || '';
    const checkId = r.check_id || r.extra?.check_id || r.extra?.id || 'semgrep';
    const severity = (r.extra && r.extra.severity) || 'MEDIUM';

    return {
      id: `${checkId}_${pathStr}_${start || 0}_${Math.random().toString(36).slice(2, 8)}`,
      source: 'Semgrep',
      detectedBy: 'semgrep',
      category: 'Security',
      categoryKey: 'security',
      severity: severity.toUpperCase(),
      title: checkId,
      description: message,
      suggestion: r.extra?.message || r.extra?.fix || '',
      line: start || null,
      file: pathStr,
      filePath: pathStr,
      codeContext: (r.extra && r.extra.lines && r.extra.lines.text) || r.extra?.lines || '',
      status: 'modified',
    };
  });
}

async function runSemgrepOnFiles(files = []) {
  if (!files || !files.length) return [];

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prsense-semgrep-'));
  try {
    writeTempFiles(files, tmp);
    const res = await runSemgrep(tmp);
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('Semgrep run failed or not installed:', res.err || res.stderr || 'unknown');
      return [];
    }
    const issues = normalizeSemgrepResult(res.json);
    return issues;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Semgrep runner error', e && e.message ? e.message : e);
    return [];
  } finally {
    // best-effort cleanup
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch (_) {}
  }
}

module.exports = { runSemgrepOnFiles };
