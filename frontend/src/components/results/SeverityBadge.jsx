export default function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    HIGH: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    MEDIUM: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    LOW: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  };

  return (
    <span role="status" aria-label={`Severity ${severity}`} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${styles[severity] || styles.LOW}`}>
      {severity}
    </span>
  );
}
