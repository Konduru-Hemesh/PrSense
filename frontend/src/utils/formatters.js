import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SEVERITY_ORDER } from './constants';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatScore(score) {
  return `${Math.max(0, Math.min(100, Math.round(score || 0)))}%`;
}

export function formatIssueCount(count) {
  return `${count} issue${count === 1 ? '' : 's'}`;
}

export function formatLine(line) {
  return line ? `Line ${line}` : 'Line n/a';
}

export function sortBySeverity(issues = []) {
  return [...issues].sort((left, right) => {
    const leftIndex = SEVERITY_ORDER.indexOf(left.severity);
    const rightIndex = SEVERITY_ORDER.indexOf(right.severity);
    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }
    return (left.line || 0) - (right.line || 0);
  });
}

export function getCategoryLabel(category) {
  switch (category) {
    case 'bugs':
      return 'Bugs';
    case 'security':
      return 'Security';
    case 'performance':
      return 'Performance';
    case 'codeSmells':
      return 'Code Smells';
    default:
      return 'All';
  }
}
