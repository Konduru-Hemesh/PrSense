import { ChevronDown } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import { LANGUAGE_OPTIONS } from '../../utils/constants';

export default function LanguageSelector() {
  const language = useAnalysisStore((state) => state.language);
  const setLanguage = useAnalysisStore((state) => state.setLanguage);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Language</span>
      <div className="relative">
        <select
          aria-label="Select code language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-white/10 bg-surface px-4 py-3 pr-10 text-sm text-text-primary outline-none transition focus:border-cyan/50 focus:ring-2 focus:ring-cyan/20"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      </div>
    </label>
  );
}
