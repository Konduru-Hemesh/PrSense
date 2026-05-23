import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import useAnalysisStore from '../../store/analysisStore';
import GlassCard from '../shared/GlassCard';
import DetectionBadge from './DetectionBadge';
import SeverityBadge from './SeverityBadge';

export default function ExplainFixModal({ open, issue, onClose }) {
  const language = useAnalysisStore((state) => state.language);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const closeButtonRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open || !issue) {
      return undefined;
    }

    let active = true;
    setLoading(true);
    setResponse(null);

    api.post('/api/explain-fix', {
      issue,
      language,
      codeContext: issue.codeContext || '',
    })
      .then((result) => {
        if (active) {
          setResponse(result.data);
        }
      })
      .catch(() => {
        if (active) {
          setResponse({
            explanation: 'The backend could not generate an explanation right now, but the issue still needs to be corrected for safety and correctness.',
            whyItMatters: issue.impact || 'It introduces avoidable production risk.',
            safeFix: issue.suggestedFix || 'Refactor the pattern to remove the risky behavior.',
            riskLevel: issue.severity || 'MEDIUM',
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      active = false;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [issue, language, onClose, open]);

  if (!open || !issue) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="explain-fix-title">
      <div ref={containerRef} className="w-full max-w-3xl">
        <GlassCard className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <p id="explain-fix-title" className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Explain Fix</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={issue.severity} />
                <DetectionBadge detectedBy={issue.detectedBy} />
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close explain fix modal"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-text-secondary transition hover:border-white/20 hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-5 px-5 py-5">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">{issue.title}</h3>
              <p className="mt-2 text-sm leading-7 text-text-secondary">{issue.description}</p>
            </div>
            {loading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-cyan" />
                Gemini is generating a deeper explanation...
              </div>
            ) : null}
            {response ? (
              <div className="grid gap-4 md:grid-cols-2">
                <GlassCard accent="cyan" className="h-full p-4">
                  <div className="flex items-center gap-2 text-cyan">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-sm font-semibold">Why it matters</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{response.whyItMatters}</p>
                </GlassCard>
                <GlassCard accent="purple" className="h-full p-4">
                  <p className="text-sm font-semibold text-purple">Safe fix</p>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{response.safeFix}</p>
                </GlassCard>
                <GlassCard accent="green" className="md:col-span-2 p-4">
                  <p className="text-sm font-semibold text-green">Plain-English explanation</p>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{response.explanation}</p>
                </GlassCard>
              </div>
            ) : null}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition hover:border-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
