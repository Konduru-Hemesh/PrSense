import { CATEGORY_TABS } from '../../utils/constants';
import { cn } from '../../utils/formatters';

export default function CategoryTabs({ activeCategory, onChange, counts = {} }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-label={`Show ${tab.label} issues`}
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-full border px-4 py-2 text-sm font-medium transition',
            activeCategory === tab.value
              ? 'border-cyan/40 bg-cyan/10 text-cyan shadow-glow-cyan'
              : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary',
          )}
        >
          {tab.label}
          {typeof counts[tab.value] === 'number' ? <span className="ml-2 text-xs text-text-muted">{counts[tab.value]}</span> : null}
        </button>
      ))}
    </div>
  );
}
