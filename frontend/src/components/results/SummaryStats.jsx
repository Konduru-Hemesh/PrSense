import { ShieldAlert, Sparkles, Layers3, TrendingUp } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import { formatIssueCount } from '../../utils/formatters';

const stats = [
  { key: 'totalIssues', label: 'Total Issues', icon: Layers3, accent: 'purple' },
  { key: 'criticalCount', label: 'Critical', icon: ShieldAlert, accent: 'amber' },
  { key: 'hasSecurityIssues', label: 'Security', icon: Sparkles, accent: 'cyan' },
  { key: 'score', label: 'Score', icon: TrendingUp, accent: 'green' },
];

export default function SummaryStats({ analysis }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const value = stat.key === 'hasSecurityIssues'
          ? analysis?.hasSecurityIssues ? 'Yes' : 'No'
          : stat.key === 'score'
            ? `${analysis?.score ?? 0}/100`
            : formatIssueCount(analysis?.[stat.key] || 0);

        const Icon = stat.icon;
        return (
          <GlassCard key={stat.key} accent={stat.accent} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">{stat.label}</p>
              <Icon className={`h-4 w-4 ${stat.accent === 'amber' ? 'text-amber' : stat.accent === 'cyan' ? 'text-cyan' : stat.accent === 'green' ? 'text-green' : 'text-purple'}`} />
            </div>
            <p className="mt-5 text-2xl font-black tracking-tight text-text-primary">{value}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
