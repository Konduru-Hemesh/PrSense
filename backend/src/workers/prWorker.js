const {
  fetchPullRequestMeta,
  fetchPullRequestFiles,
} = require('../services/githubService');
const { buildPatchContexts } = require('../services/githubService');
const { analyzePullRequestFiles } = require('../analyzers/staticAnalyzer');
const { runSemgrepOnFiles } = require('../analyzers/semgrepRunner');
const { analyzePullRequestSemantic } = require('../services/geminiService');
const { mergeResults } = require('../utils/mergeResults');
const { postCheckRun, createPRComment } = require('../services/githubService');
const { getSettingsForRepo } = require('../services/settingsService');
const { recordEvent } = require('../services/auditService');
const metrics = require('../services/metricsService');

async function process(job) {
  const { owner, repo, pullNumber, analysisMode = 'deep-review' } = job;
  // eslint-disable-next-line no-console
  console.log(`Processing PR ${owner}/${repo}#${pullNumber}`);

  const endTimer = metrics.prProcessingTime.startTimer();
  metrics.prProcessed.inc();

  try {
    const [pullRequest, files] = await Promise.all([
      fetchPullRequestMeta(owner, repo, pullNumber),
      fetchPullRequestFiles(owner, repo, pullNumber),
    ]);

    const patchContexts = buildPatchContexts(files);
    const staticResult = analyzePullRequestFiles(patchContexts);

    // run semgrep where available and merge findings into static result
    try {
      const semgrepIssues = await runSemgrepOnFiles(patchContexts);
      metrics.semgrepRuns.inc();
      if (Array.isArray(semgrepIssues) && semgrepIssues.length) {
        staticResult.issues = [...semgrepIssues, ...(staticResult.issues || [])];
        staticResult.totalIssues = staticResult.issues.length;
        staticResult.summary = `Static engines found ${staticResult.totalIssues} issues (semgrep + heuristics).`;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Semgrep runner failed', e && e.message ? e.message : e);
    }
    const aiResult = await analyzePullRequestSemantic({
      pr: {
        owner,
        repo,
        pullNumber,
        title: pullRequest.title,
        body: pullRequest.body,
        state: pullRequest.state,
        htmlUrl: pullRequest.html_url,
        baseBranch: pullRequest.base?.ref,
        headBranch: pullRequest.head?.ref,
        user: pullRequest.user?.login,
      },
      files: patchContexts,
      analysisMode,
      staticSummary: staticResult.summary,
    });

    const mergedResult = mergeResults(staticResult, aiResult, {
      owner,
      repo,
      pullNumber,
      url: pullRequest.html_url,
      title: pullRequest.title,
      body: pullRequest.body,
      state: pullRequest.state,
      baseBranch: pullRequest.base?.ref,
      headBranch: pullRequest.head?.ref,
      author: pullRequest.user?.login,
    }, patchContexts);

    // Post a summary check run
    try {
      const headSha = pullRequest.head?.sha || null;
      await postCheckRun(owner, repo, headSha, 'PRSense Review', mergedResult.summary || `Score: ${mergedResult.score}`, 'neutral');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to post check run', err.message || err);
    }

    // Post inline comments for top issues (non-blocking)
    try {
      const issues = mergedResult.issues || [];
      const top = issues.slice(0, 6);
      const { computePositionFromPatch } = require('../utils/patchUtils');
      const settings = getSettingsForRepo(owner, repo) || { autoPostComments: true, commentThreshold: 0 };
      const autoPost = settings.autoPostComments !== false;
      const threshold = Number.isFinite(settings.commentThreshold) ? settings.commentThreshold : 0;
      for (const issue of top) {
        try {
          const path = issue.filePath || issue.file || null;
          const line = Number.isFinite(issue.line) ? issue.line : null;
          let position = null;
          if (path && Number.isFinite(line)) {
            const fileContext = patchContexts.find((f) => f.filename === path || f.filename === (path || '').replace(/^\//, ''));
            if (fileContext) {
              position = computePositionFromPatch(fileContext.patch || '', line);
            }
          }

          const body = `PRSense: ${issue.title}\n\n${issue.description || issue.suggestion || ''}\n\nSeverity: ${issue.severity || 'MEDIUM'}`;
          // If comment threshold set and mergedResult.score is below threshold (or above?)
          // We'll interpret threshold as minimum score required to auto-post comments; if mergedResult.score < threshold, skip posting.
          const shouldPost = autoPost && (typeof threshold !== 'number' || mergedResult.score >= threshold);

          if (shouldPost) {
            await createPRComment(owner, repo, pullNumber, body, path, line, pullRequest.head?.sha, position);
            metrics.commentsPosted.inc();
            recordEvent({ type: 'comment.posted', repo: `${owner}/${repo}`, pullNumber, issue: { id: issue.id, title: issue.title, file: path, line } });
          } else {
            // persist proposed comment for audit / draft review
            metrics.commentsSkipped.inc();
            recordEvent({ type: 'comment.proposed', repo: `${owner}/${repo}`, pullNumber, issue: { id: issue.id, title: issue.title, file: path, line }, body });
          }
        } catch (inner) {
          // eslint-disable-next-line no-console
          console.warn('Failed to create PR comment for issue', inner.message || inner);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to post inline comments', err.message || err);
    }

    // eslint-disable-next-line no-console
    console.log('PR analysis complete:', {
      owner,
      repo,
      pullNumber,
      score: mergedResult.score,
      totalIssues: mergedResult.totalIssues || (mergedResult?.issues || []).length,
    });

    endTimer();

    return mergedResult;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing PR job', error);
    throw error;
  }
}

module.exports = { process };
