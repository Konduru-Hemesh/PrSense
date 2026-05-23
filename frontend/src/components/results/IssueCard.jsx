import { memo, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, MessageSquareMore } from 'lucide-react';
import DetectionBadge from './DetectionBadge';
import SeverityBadge from './SeverityBadge';
import GlassCard from '../shared/GlassCard';
import { cn, formatLine } from '../../utils/formatters';

function IssueCard({ issue, onExplain, onHighlight }) {
  const [expanded, setExpanded] = useState(issue.detectedBy !== 'ai');

  const codeContext = useMemo(() => {
    if (!issue?.codeContext) {
      return '';
    }
    return issue.codeContext.trim();
  }, [issue?.codeContext]);

  return (
    <GlassCard className={cn('p-0', expanded ? 'border-white/10' : 'border-white/5')} accent={issue.detectedBy === 'both' ? 'purple' : issue.detectedBy === 'ai' ? 'cyan' : 'amber'}>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={issue.severity} />
              <DetectionBadge detectedBy={issue.detectedBy} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-text-primary">{issue.title}</h3>
            <p className="mt-2 text-sm leading-7 text-text-secondary">{issue.description}</p>
          </div>
          <button
            type="button"
            aria-label={expanded ? 'Collapse issue details' : 'Expand issue details'}
            onClick={() => setExpanded((value) => !value)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-text-secondary transition hover:border-white/20 hover:text-text-primary"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
          {issue.filePath ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{issue.filePath}</span> : null}
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{formatLine(issue.line)}</span>
          {issue.ruleId ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{issue.ruleId}</span> : null}
        </div>

        {expanded && codeContext ? (
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090910] p-4 font-mono text-xs leading-6 text-text-secondary">
            <code>{codeContext}</code>
          </pre>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            aria-label="Highlight issue in editor"
            onClick={onHighlight}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-cyan"
          >
            <Eye className="h-4 w-4" />
            Highlight in Editor
          </button>
          <button
            type="button"
            aria-label="Explain how to fix this issue"
            onClick={onExplain}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition hover:border-purple/40 hover:bg-purple/10 hover:text-purple"
          >
            <MessageSquareMore className="h-4 w-4" />
            Explain Fix
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export default memo(IssueCard);
