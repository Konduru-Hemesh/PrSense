const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const prProcessed = new client.Counter({ name: 'prsense_prs_processed_total', help: 'Total PRs processed' });
const commentsPosted = new client.Counter({ name: 'prsense_comments_posted_total', help: 'Total comments posted to PRs' });
const commentsSkipped = new client.Counter({ name: 'prsense_comments_skipped_total', help: 'Total comments skipped (not auto-posted)' });
const semgrepRuns = new client.Counter({ name: 'prsense_semgrep_runs_total', help: 'Total semgrep runs' });
const prProcessingTime = new client.Histogram({ name: 'prsense_pr_processing_seconds', help: 'PR processing duration seconds', buckets: [0.5, 1, 2, 5, 10, 30, 60] });

module.exports = {
  client,
  prProcessed,
  commentsPosted,
  commentsSkipped,
  semgrepRuns,
  prProcessingTime,
};
