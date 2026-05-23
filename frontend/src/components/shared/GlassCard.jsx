import { cn } from '../../utils/formatters';

export default function GlassCard({ className = '', children, accent = 'purple', ...props }) {
  const accentClass = {
    purple: 'border-purple/30 shadow-glow-purple',
    cyan: 'border-cyan/30 shadow-glow-cyan',
    pink: 'border-pink/30 shadow-glow-pink',
    amber: 'border-amber/30 shadow-glow-amber',
    green: 'border-green/30 shadow-glow-green',
  }[accent] || 'border-white/10';

  return (
    <div
      className={cn(
        'glass-card relative overflow-hidden border px-5 py-4 text-left transition duration-300 hover:-translate-y-0.5',
        accentClass,
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-70" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
