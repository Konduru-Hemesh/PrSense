import { motion } from 'framer-motion';
import { formatScore } from '../../utils/formatters';

export default function ScoreGauge({ score = 0 }) {
  const normalized = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 66;
  const dashOffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="glass-card flex h-full items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <svg viewBox="0 0 180 180" className="h-48 w-48 -rotate-90 sm:h-56 sm:w-56">
          <circle cx="90" cy="90" r="66" className="fill-none stroke-white/10" strokeWidth="14" />
          <motion.circle
            cx="90"
            cy="90"
            r="66"
            className="fill-none stroke-cyan"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">Score</p>
          <p className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl">{formatScore(normalized)}</p>
          <p className="text-xs text-text-secondary">Higher means cleaner code</p>
        </div>
      </div>
    </div>
  );
}
