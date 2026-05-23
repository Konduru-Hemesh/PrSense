import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CodeEditor from '../components/dashboard/CodeEditor';
import LanguageSelector from '../components/dashboard/LanguageSelector';
import FileUploader from '../components/dashboard/FileUploader';
import AnalyzeButton from '../components/dashboard/AnalyzeButton';
import LiveResultsPanel from '../components/results/LiveResultsPanel';
import GlassCard from '../components/shared/GlassCard';
import useAnalysisStore from '../store/analysisStore';
import { formatIssueCount, sortBySeverity } from '../utils/formatters';

export default function DashboardPage() {
  const phase = useAnalysisStore((state) => state.phase);
  const staticResult = useAnalysisStore((state) => state.staticResult);
  const mergedResult = useAnalysisStore((state) => state.mergedResult);
  const language = useAnalysisStore((state) => state.language);
  const analysisMode = useAnalysisStore((state) => state.analysisMode);
  const reviewTarget = useAnalysisStore((state) => state.reviewTarget);
  const uploadedFileName = useAnalysisStore((state) => state.uploadedFileName);
  const prUrl = useAnalysisStore((state) => state.prUrl);
  const repoUrl = useAnalysisStore((state) => state.repoUrl);
  const setPrUrl = useAnalysisStore((state) => state.setPrUrl);
  const setRepoUrl = useAnalysisStore((state) => state.setRepoUrl);
  const setReviewTarget = useAnalysisStore((state) => state.setReviewTarget);
  const setAnalysisMode = useAnalysisStore((state) => state.setAnalysisMode);
  const [tipsOpen, setTipsOpen] = useState(true);

  const phaseCopy = {
    fetching: reviewTarget === 'code' ? '🌐 Preparing analysis...' : '🌐 Fetching source... ',
    extracting: reviewTarget === 'code' ? '🧩 Extracting code...' : '🧩 Extracting files...',
    static: '⚡ Running static rules...',
    ai: '🤖 AI analyzing...',
    merging: '✦ Combining results...',
    error: 'AI unavailable, using static analysis only',
    done: 'Ready',
    idle: '',
  }[phase] || 'Ready';

  const phaseDotClass = {
    fetching: 'bg-cyan shadow-[0_0_16px_rgba(6,182,212,0.8)] animate-pulse',
    extracting: 'bg-purple shadow-[0_0_16px_rgba(139,92,246,0.8)] animate-pulse',
    static: 'bg-amber shadow-[0_0_16px_rgba(245,158,11,0.8)] animate-pulse',
    ai: 'bg-cyan shadow-[0_0_16px_rgba(6,182,212,0.8)] animate-pulse',
    merging: 'bg-purple shadow-[0_0_16px_rgba(139,92,246,0.8)] animate-pulse',
    error: 'bg-green shadow-[0_0_16px_rgba(16,185,129,0.8)]',
    done: 'bg-green shadow-[0_0_16px_rgba(16,185,129,0.8)]',
    idle: 'bg-transparent',
  }[phase] || 'bg-green';

  const staticIssues = useMemo(() => sortBySeverity([
    ...(staticResult?.security || []),
    ...(staticResult?.performance || []),
    ...(staticResult?.codeSmells || []),
    ...(staticResult?.bugs || []),
  ]), [staticResult]);

  return (
    <div className="min-h-screen bg-base px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <CodeEditor />

        <div className="space-y-6">
          <GlassCard>
            <div className="space-y-4">
              <div>
                <p className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Review target</p>
                <div className="grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-surface p-1 sm:grid-cols-3">
                  {[
                    { value: 'code', label: 'Normal Code Analyzer', description: 'Paste code or upload a file' },
                    { value: 'pull-request', label: 'GitHub Pull Request', description: 'Review a public PR URL' },
                    { value: 'repository', label: 'GitHub Repository', description: 'Scan a public repo URL' },
                  ].map((target) => (
                    <button
                      key={target.value}
                      type="button"
                      aria-label={`Set review target to ${target.label}`}
                      onClick={() => setReviewTarget(target.value)}
                      className={`rounded-xl px-3 py-3 text-left transition ${reviewTarget === target.value ? 'bg-white/10 text-text-primary shadow-glow-purple' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
                    >
                      <span className="block text-sm font-semibold">{target.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-text-muted">{target.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {reviewTarget === 'code' ? <LanguageSelector /> : null}

              {reviewTarget === 'code' ? (
                <FileUploader />
              ) : reviewTarget === 'pull-request' ? (
                <div>
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">GitHub Pull Request</p>
                  <div className="rounded-2xl border border-white/10 bg-surface p-3 shadow-inner shadow-black/20">
                    <input
                      type="url"
                      value={prUrl}
                      onChange={(event) => setPrUrl(event.target.value)}
                      placeholder="https://github.com/user/repo/pull/12"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-cyan/40 focus:bg-white/[0.08]"
                    />
                    <p className="mt-3 text-xs leading-5 text-text-muted">Paste a public GitHub PR URL to review the diff instead of the editor content.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">GitHub Repository</p>
                  <div className="rounded-2xl border border-white/10 bg-surface p-3 shadow-inner shadow-black/20">
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(event) => setRepoUrl(event.target.value)}
                      placeholder="https://github.com/user/repo"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-cyan/40 focus:bg-white/[0.08]"
                    />
                    <p className="mt-3 text-xs leading-5 text-text-muted">Paste a public GitHub repository URL to analyze the source files in that repo.</p>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Review mode</p>
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-surface p-1">
                  {[
                    { value: 'deep-review', label: 'Deep Review', description: 'Best for bugs and architecture' },
                    { value: 'explain-code', label: 'Explain Code', description: 'Best for code summary and improvements' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      aria-label={`Set review mode to ${mode.label}`}
                      onClick={() => setAnalysisMode(mode.value)}
                      className={`rounded-xl px-3 py-3 text-left transition ${analysisMode === mode.value ? 'bg-white/10 text-text-primary shadow-glow-purple' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
                    >
                      <span className="block text-sm font-semibold">{mode.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-text-muted">{mode.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnalyzeButton />
              {phase !== 'idle' ? (
                <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
                  <span className={`h-2.5 w-2.5 rounded-full ${phaseDotClass}`} />
                  {phaseCopy}
                </div>
              ) : null}
            </div>
          </GlassCard>

          <LiveResultsPanel />

          <GlassCard>
            <button
              type="button"
              aria-label="Toggle tips"
              onClick={() => setTipsOpen((value) => !value)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Tips</p>
                <p className="mt-2 text-sm text-text-secondary">Use the editor line highlight to jump straight back to a finding from the results page.</p>
              </div>
              {tipsOpen ? <ChevronUp className="h-4 w-4 text-text-secondary" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
            </button>
            {tipsOpen ? (
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <p>- Upload a source file to auto-detect language.</p>
                <p>- Paste a GitHub PR URL to review only the changed patch files.</p>
                <p>- Paste a GitHub repository URL to scan sampled source files across the repo.</p>
                <p>- Static results appear first, then AI findings merge in without blocking the flow.</p>
                <p>- Reanalyze after edits to compare how the score changes.</p>
                <p>- Current static detections: {formatIssueCount(staticIssues.length)}</p>
                {mergedResult ? <p>• Latest score: {mergedResult.score}/100</p> : null}
              </div>
            ) : null}
          </GlassCard>

          <GlassCard accent="cyan">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Current Input</p>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <p><span className="text-text-primary">Target:</span> {reviewTarget}</p>
              <p><span className="text-text-primary">Language:</span> {language}</p>
              <p><span className="text-text-primary">Mode:</span> {analysisMode}</p>
              {reviewTarget === 'pull-request' ? (
                <p><span className="text-text-primary">PR URL:</span> {prUrl || 'No PR URL provided'}</p>
              ) : null}
              {reviewTarget === 'repository' ? (
                <p><span className="text-text-primary">Repo URL:</span> {repoUrl || 'No repository URL provided'}</p>
              ) : null}
              {reviewTarget === 'code' ? (
                <p><span className="text-text-primary">Source:</span> {uploadedFileName || 'Paste code or upload a file'}</p>
              ) : null}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
