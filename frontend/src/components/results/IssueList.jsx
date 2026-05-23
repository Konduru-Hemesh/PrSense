import { useMemo } from 'react';
import IssueCard from './IssueCard';
import { sortBySeverity } from '../../utils/formatters';

export default function IssueList({ issues = [], onExplain, onHighlight, emptyLabel = 'No issues in this category.' }) {
  const sortedIssues = useMemo(() => sortBySeverity(issues), [issues]);

  if (!sortedIssues.length) {
    return (
      <div className="glass-card p-8 text-center text-sm text-text-secondary">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedIssues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onExplain={() => onExplain(issue)}
          onHighlight={() => onHighlight(issue)}
        />
      ))}
    </div>
  );
}
