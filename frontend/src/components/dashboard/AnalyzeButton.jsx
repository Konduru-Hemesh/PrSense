import { Zap } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import useAnalysis from '../../hooks/useAnalysis';

export default function AnalyzeButton() {
  const phase = useAnalysisStore((state) => state.phase);
  const code = useAnalysisStore((state) => state.code);
  const prUrl = useAnalysisStore((state) => state.prUrl);
  const { analyze, isAnalyzing } = useAnalysis();
  const hasCode = Boolean(code && code.trim());
  const hasPrUrl = Boolean(prUrl && prUrl.trim());
  const busy = isAnalyzing || ['static', 'ai', 'merging'].includes(phase);

  const label = phase === 'static'
    ? 'Running static analysis...'
    : phase === 'ai'
      ? 'AI analyzing...'
      : phase === 'merging'
        ? 'Combining results...'
        : phase === 'fetching'
          ? 'Fetching pull request...'
          : phase === 'extracting'
            ? 'Extracting files...'
            : hasPrUrl
              ? 'Analyze Pull Request'
              : !hasCode
    ? 'Add code or PR URL to analyze'
              : 'Analyze Code';

  return (
    <button
      type="button"
      aria-label="Run PRSense analysis"
      onClick={analyze}
      disabled={busy || (!hasCode && !hasPrUrl)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple to-violet px-5 py-3.5 text-sm font-semibold text-white shadow-glow-purple transition hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(139,92,246,0.38)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Zap className={busy ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
      {label}
    </button>
  );
}
