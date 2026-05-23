import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, ArrowUpRight } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import GlassCard from '../shared/GlassCard';
import { sortBySeverity, formatLine } from '../../utils/formatters';

export default function LiveResultsPanel() {
  const phase = useAnalysisStore((state) => state.phase);
  const staticResult = useAnalysisStore((state) => state.staticResult);
  const aiResult = useAnalysisStore((state) => state.aiResult);

  const issues = sortBySeverity([
    ...(staticResult?.security || []),
    ...(staticResult?.performance || []),
    ...(staticResult?.codeSmells || []),
    ...(staticResult?.bugs || []),
  ]).slice(0, 5);

  const visible = phase !== 'idle' && Boolean(staticResult);
  const complete = phase === 'done' || phase === 'error' || Boolean(aiResult);
  const headerText = complete ? '✦ Analysis Complete' : '⚡ Instant Analysis';
  const accent = complete ? 'purple' : 'amber';

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.25 }}
        >
          <GlassCard accent={accent} className="border-l-4 border-l-amber/60 p-0">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${complete ? 'border-purple/30 bg-purple/10 text-purple' : 'border-amber/30 bg-amber/10 text-amber'}`}>
                    {headerText}
                  </span>
                  {!complete ? <Loader2 className="h-4 w-4 animate-spin text-cyan" /> : <Sparkles className="h-4 w-4 text-cyan" />}
                </div>
                <p className="mt-2 text-sm text-text-secondary">{complete ? 'Static and AI findings have been merged.' : 'Static engine has started surfacing findings while AI continues in parallel.'}</p>
              </div>
              {!complete ? <div className="h-3 w-3 rounded-full bg-cyan shadow-[0_0_18px_rgba(6,182,212,0.75)] animate-pulse" /> : <ArrowUpRight className="h-4 w-4 text-purple" />}
            </div>
            <div className="space-y-3 px-5 py-4">
              {issues.map((issue) => (
                <div key={issue.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-semibold text-text-secondary">{issue.severity}</span>
                      <span>{formatLine(issue.line)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-text-primary">{issue.title}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${issue.severity === 'CRITICAL' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : issue.severity === 'HIGH' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'}`}>
                    {issue.severity}
                  </span>
                </div>
              ))}
              {((staticResult?.security?.length || 0) + (staticResult?.performance?.length || 0) + (staticResult?.codeSmells?.length || 0) + (staticResult?.bugs?.length || 0)) > 5 ? (
                <p className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
                  + {((staticResult?.security?.length || 0) + (staticResult?.performance?.length || 0) + (staticResult?.codeSmells?.length || 0) + (staticResult?.bugs?.length || 0)) - 5} more issues found
                </p>
              ) : null}
            </div>
          </GlassCard>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
