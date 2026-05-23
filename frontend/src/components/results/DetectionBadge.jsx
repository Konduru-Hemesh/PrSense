export default function DetectionBadge({ detectedBy }) {
  const config = {
    static: {
      label: '⚡ Static Engine',
      className: 'border-amber/40 bg-[#1a1a2e] text-amber',
      ariaLabel: 'Detected by static engine',
    },
    ai: {
      label: '🤖 AI Analysis',
      className: 'border-cyan/40 bg-[#0d1a2e] text-cyan',
      ariaLabel: 'Detected by AI analysis',
    },
    both: {
      label: '✦ Both Engines',
      className: 'border-purple/40 bg-[#1a0d2e] text-purple',
      ariaLabel: 'Detected by both the static engine and AI analysis',
    },
  }[detectedBy] || {
    label: 'Static Engine',
    className: 'border-white/10 bg-white/5 text-text-secondary',
    ariaLabel: 'Detection source unknown',
  };

  return (
    <span aria-label={config.ariaLabel} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}
