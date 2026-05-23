const { parsePullRequestUrl, fetchPullRequestMeta, fetchPullRequestFiles, buildPatchContexts } = require('../services/githubService');
const { analyzePullRequestFiles } = require('../analyzers/staticAnalyzer');
const { analyzePullRequestSemantic } = require('../services/geminiService');
const { mergeResults } = require('../utils/mergeResults');

async function analyzePullRequest(req, res, next) {
  try {
    const { prUrl, analysisMode } = req.body;
    const parsed = parsePullRequestUrl(prUrl);
    const [pullRequest, files] = await Promise.all([
      fetchPullRequestMeta(parsed.owner, parsed.repo, parsed.pullNumber),
      fetchPullRequestFiles(parsed.owner, parsed.repo, parsed.pullNumber),
    ]);

    const patchContexts = buildPatchContexts(files);
    const staticResult = analyzePullRequestFiles(patchContexts);
    const aiResult = await analyzePullRequestSemantic({
      pr: {
        ...parsed,
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
      owner: parsed.owner,
      repo: parsed.repo,
      pullNumber: parsed.pullNumber,
      url: parsed.htmlUrl,
      title: pullRequest.title,
      body: pullRequest.body,
      state: pullRequest.state,
      baseBranch: pullRequest.base?.ref,
      headBranch: pullRequest.head?.ref,
      author: pullRequest.user?.login,
    }, patchContexts);

    res.json({
      reviewType: 'github-pr',
      pr: mergedResult.pr,
      files: mergedResult.files,
      staticResult,
      aiResult,
      mergedResult,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzePullRequest,
};