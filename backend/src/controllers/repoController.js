const { parseGitHubRepoUrl, fetchRepositoryMeta, fetchRepositoryTree, fetchRepositoryFiles, buildRepositoryContexts } = require('../services/githubService');
const { analyzeRepositoryFiles } = require('../analyzers/staticAnalyzer');
const { analyzeRepositorySemantic } = require('../services/geminiService');
const { mergeResults } = require('../utils/mergeResults');

async function analyzeRepository(req, res, next) {
  try {
    const { repoUrl, analysisMode } = req.body;
    const parsed = parseGitHubRepoUrl(repoUrl);

    const repository = await fetchRepositoryMeta(parsed.owner, parsed.repo);
    const tree = await fetchRepositoryTree(parsed.owner, parsed.repo, repository.default_branch);
    const sourceFiles = await fetchRepositoryFiles(parsed.owner, parsed.repo, tree);
    const repoContexts = buildRepositoryContexts(sourceFiles, repository);

    const staticResult = analyzeRepositoryFiles(repoContexts);
    const aiResult = await analyzeRepositorySemantic({
      repo: {
        owner: parsed.owner,
        repo: parsed.repo,
        url: parsed.htmlUrl,
        defaultBranch: repository.default_branch,
        description: repository.description || '',
        language: repository.language || '',
        stars: repository.stargazers_count || 0,
        forks: repository.forks_count || 0,
      },
      files: repoContexts,
      analysisMode,
      staticSummary: staticResult.summary,
    });

    const mergedResult = mergeResults(staticResult, aiResult, {
      reviewType: 'github-repo',
      owner: parsed.owner,
      repo: parsed.repo,
      url: parsed.htmlUrl,
      defaultBranch: repository.default_branch,
      description: repository.description || '',
      language: repository.language || '',
      stars: repository.stargazers_count || 0,
      forks: repository.forks_count || 0,
      openIssues: repository.open_issues_count || 0,
      homepage: repository.homepage || '',
    }, repoContexts);

    res.json({
      reviewType: 'github-repo',
      repo: mergedResult.repo,
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
  analyzeRepository,
};
