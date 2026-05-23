import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ScoreGauge from '../components/results/ScoreGauge';
import SummaryStats from '../components/results/SummaryStats';
import CategoryTabs from '../components/results/CategoryTabs';
import IssueList from '../components/results/IssueList';
import ExplainFixModal from '../components/results/ExplainFixModal';
import DetectionBadge from '../components/results/DetectionBadge';
import GlassCard from '../components/shared/GlassCard';
import GlowButton from '../components/shared/GlowButton';
import useAnalysisStore from '../store/analysisStore';

export default function ResultsPage() {
  const navigate = useNavigate();
  const mergedResult = useAnalysisStore((state) => state.mergedResult);
  const activeCategory = useAnalysisStore((state) => state.activeCategory);
  const setActiveCategory = useAnalysisStore((state) => state.setActiveCategory);
  const setActiveIssue = useAnalysisStore((state) => state.setActiveIssue);
  const code = useAnalysisStore((state) => state.code);
  const language = useAnalysisStore((state) => state.language);
  const analysisMode = useAnalysisStore((state) => state.analysisMode);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState('all');
  const reviewType = mergedResult?.reviewType || 'code';
  const files = Array.isArray(mergedResult?.files) ? mergedResult.files : [];

  useEffect(() => {
    if (!selectedIssue) {
      return undefined;
    }

    const matching = [
      ...(mergedResult?.bugs || []),
      ...(mergedResult?.security || []),
      ...(mergedResult?.performance || []),
      ...(mergedResult?.codeSmells || []),
    ].find((issue) => issue.id === selectedIssue.id);

    if (matching) {
      setSelectedIssue(matching);
    }
    return undefined;
  }, [mergedResult, selectedIssue]);

  const allIssues = useMemo(() => ([
    ...(mergedResult?.bugs || []),
    ...(mergedResult?.security || []),
    ...(mergedResult?.performance || []),
    ...(mergedResult?.codeSmells || []),
  ]), [mergedResult]);

  const counts = useMemo(() => ({
    all: allIssues.length,
    bugs: mergedResult?.bugs?.length || 0,
    security: mergedResult?.security?.length || 0,
    performance: mergedResult?.performance?.length || 0,
    codeSmells: mergedResult?.codeSmells?.length || 0,
  }), [allIssues.length, mergedResult]);

  const filteredIssues = useMemo(() => {
    const categoryIssues = activeCategory === 'all' ? allIssues : (mergedResult?.[activeCategory] || []);
    if (reviewType !== 'github-pr' || selectedFilePath === 'all') {
      return categoryIssues;
    }

    return categoryIssues.filter((issue) => String(issue.filePath || issue.file || '').toLowerCase() === selectedFilePath.toLowerCase());
  }, [activeCategory, allIssues, mergedResult, reviewType, selectedFilePath]);

  const improvementBullets = useMemo(() => {
    const source = mergedResult?.improvements;
    if (Array.isArray(source) && source.length > 0) {
      return source.slice(0, 4);
    }

    return allIssues.slice(0, 4).map((issue) => issue.suggestedFix).filter(Boolean);
  }, [allIssues, mergedResult]);

  const whatItDoesPoints = useMemo(() => {
    if (Array.isArray(mergedResult?.whatItDoesPoints) && mergedResult.whatItDoesPoints.length > 0) {
      return mergedResult.whatItDoesPoints.slice(0, 5);
    }

    const raw = String(mergedResult?.whatItDoes || '').trim();
    if (!raw) {
      return [];
    }

    return raw
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.replace(/[.!?]+$/, '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }, [mergedResult]);

  useEffect(() => {
    if (reviewType !== 'github-pr') {
      setSelectedFilePath('all');
      return;
    }

    if (!files.length) {
      setSelectedFilePath('all');
      return;
    }

    const fileExists = files.some((file) => String(file.filename || '').toLowerCase() === selectedFilePath.toLowerCase());
    if (!fileExists) {
      setSelectedFilePath(files[0].filename || 'all');
    }
  }, [files, reviewType, selectedFilePath]);

  if (!mergedResult) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleHighlight = (issue) => {
    setActiveIssue(issue);
    navigate('/dashboard');
  };

  const handleExplain = (issue) => {
    setSelectedIssue(issue);
  };

  const reanalyze = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-base px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-surface/80 px-5 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <GlowButton as={Link} to="/dashboard" variant="subtle" className="px-4 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </GlowButton>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">Analysis Complete</p>
              <p className="mt-1 text-sm text-text-secondary">Static and AI findings merged into one review.</p>
            </div>
          </div>
          <GlowButton as="button" variant="primary" onClick={reanalyze} className="px-4 py-2.5">
            <RefreshCw className="h-4 w-4" />
            Re-Analyze
          </GlowButton>
        </div>

        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-amber/30 bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-amber">⚡ {mergedResult.staticOnlyCount || 0} issues from Static Engine</div>
            <div className="rounded-full border border-cyan/30 bg-[#0d1a2e] px-4 py-2 text-sm font-semibold text-cyan">🤖 {mergedResult.aiOnlyCount || 0} issues from AI Analysis</div>
            <div className="rounded-full border border-purple/30 bg-[#1a0d2e] px-4 py-2 text-sm font-semibold text-purple">✦ {mergedResult.bothCount || 0} issues from Both Engines</div>
          </div>
        </GlassCard>

        {reviewType === 'github-pr' ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-start">
              <ScoreGauge score={mergedResult.score} />
              <GlassCard className="h-full">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">GitHub Pull Request Review</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-text-primary">
                  {mergedResult?.pr?.title || `${mergedResult?.pr?.owner || ''}/${mergedResult?.pr?.repo || ''} #${mergedResult?.pr?.pullNumber || ''}`}
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  {mergedResult?.pr?.owner}/{mergedResult?.pr?.repo} · {mergedResult?.pr?.baseBranch || 'base'} → {mergedResult?.pr?.headBranch || 'head'}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <DetectionBadge detectedBy="static" />
                  <DetectionBadge detectedBy="ai" />
                  <DetectionBadge detectedBy="both" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{files.length} changed files</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">PR #{mergedResult?.pr?.pullNumber || 'n/a'}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{mergedResult?.pr?.state || 'open'}</span>
                </div>
              </GlassCard>
            </div>

          </>
        ) : null}

        {analysisMode === 'explain-code' && reviewType !== 'github-pr' ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
            <GlassCard accent="cyan" className="h-full">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">What this code does</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                {whatItDoesPoints.length > 0 ? whatItDoesPoints.map((point, index) => (
                  <div key={`${point}-${index}`} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                    <span className="mr-2 text-cyan">{index + 1}.</span>
                    {point}
                  </div>
                )) : (
                  <p>{mergedResult.whatItDoes || mergedResult.summary || 'Deep analysis complete.'}</p>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-text-muted">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Language: {language}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Mode: {analysisMode}</span>
              </div>
            </GlassCard>

            <GlassCard accent="purple" className="h-full">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">How to improve it</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                {improvementBullets.length > 0 ? improvementBullets.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                    <span className="mr-2 text-purple">{index + 1}.</span>
                    {item}
                  </div>
                )) : (
                  <p>No improvement suggestions available yet.</p>
                )}
              </div>
            </GlassCard>
          </div>
        ) : null}

        <SummaryStats analysis={mergedResult} />

        {analysisMode === 'deep-review' && reviewType !== 'github-pr' ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-start">
            <ScoreGauge score={mergedResult.score} />
            <GlassCard className="h-full">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Overview</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-text-primary">{mergedResult.summary || 'Analysis complete.'}</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">The static engine surfaces known patterns instantly while Gemini adds deeper reasoning. Findings that matched on both sides are collapsed into a single, higher-confidence review card.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <DetectionBadge detectedBy="static" />
                <DetectionBadge detectedBy="ai" />
                <DetectionBadge detectedBy="both" />
              </div>
            </GlassCard>
          </div>
        ) : null}

        {reviewType === 'github-pr' ? (
          <div className="grid gap-6 xl:grid-cols-[280px_1fr] items-start">
            <GlassCard className="h-full p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Changed Files</p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedFilePath('all')}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${selectedFilePath === 'all' ? 'border-cyan/40 bg-cyan/10 text-cyan shadow-glow-cyan' : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary'}`}
                >
                  <span className="text-sm font-medium">All files</span>
                  <span className="text-xs text-text-muted">{mergedResult.totalIssues || filteredIssues.length}</span>
                </button>
                {files.map((file) => (
                  <button
                    key={file.filename}
                    type="button"
                    onClick={() => setSelectedFilePath(file.filename)}
                    className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${selectedFilePath === file.filename ? 'border-purple/40 bg-purple/10 text-purple shadow-glow-purple' : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary'}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.filename}</p>
                      <p className="mt-1 text-xs text-text-muted">{file.language} · {file.status}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-text-muted">
                      <p>{file.issueCount || 0}</p>
                      <p>issues</p>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} counts={counts} />
              </div>
              <IssueList
                issues={filteredIssues}
                onExplain={handleExplain}
                onHighlight={handleHighlight}
                emptyLabel={selectedFilePath === 'all' ? 'No findings in this category.' : 'No findings for the selected file.'}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} counts={counts} />
            <IssueList issues={filteredIssues} onExplain={handleExplain} onHighlight={handleHighlight} emptyLabel="No findings in this category." />
          </div>
        )}
      </div>

      <ExplainFixModal open={Boolean(selectedIssue)} issue={selectedIssue} codeContext={selectedIssue?.codeContext || code} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}
