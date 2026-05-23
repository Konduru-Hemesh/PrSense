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
  const uploadedFileName = useAnalysisStore((state) => state.uploadedFileName);
  const prUrl = useAnalysisStore((state) => state.prUrl);
  const setPrUrl = useAnalysisStore((state) => state.setPrUrl);
  const setAnalysisMode = useAnalysisStore((state) => state.setAnalysisMode);
  const [tipsOpen, setTipsOpen] = useState(true);

  const phaseCopy = {
    fetching: '🌐 Fetching pull request...',
    extracting: '🧩 Extracting changed files...',
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
                <p className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">GitHub Pull Request</p>
                <div className="rounded-2xl border border-white/10 bg-surface p-3 shadow-inner shadow-black/20">
                  <input
                    type="url"
                    value={prUrl}
                    onChange={(event) => setPrUrl(event.target.value)}
                    placeholder="https://github.com/user/repo/pull/12"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-cyan/40 focus:bg-white/[0.08]"
                  />
                  <p className="mt-3 text-xs leading-5 text-text-muted">
                    Paste a public GitHub PR URL to review the diff instead of the editor content.
                  </p>
                </div>
              </div>
              <LanguageSelector />
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
              <FileUploader />
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
              <p><span className="text-text-primary">Language:</span> {language}</p>
              <p><span className="text-text-primary">Mode:</span> {analysisMode}</p>
              <p><span className="text-text-primary">PR URL:</span> {prUrl || 'No PR URL provided'}</p>
              <p><span className="text-text-primary">Source:</span> {uploadedFileName || 'Paste code or upload a file'}</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
