import type { RiskLevel, RecommendationStatus, AssessmentType } from './types';

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  LOW: 'Low risk',
  MEDIUM: 'Medium risk',
  HIGH: 'High risk',
};

export const RECOMMENDATION_STATUS_LABEL: Record<RecommendationStatus, string> = {
  PENDING: 'Pending',
  SENT: 'Sent',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
};

export const ASSESSMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  QUIZ: 'Quiz',
  COURSEWORK: 'Coursework',
  EXAM: 'Exam',
  PROJECT: 'Project',
};

export function weightedAverage(
  records: { score: number; maxScore: number; weight: number }[],
): number {
  if (records.length === 0) return 0;
  const totalWeight = records.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = records.reduce(
    (sum, r) => sum + (r.score / r.maxScore) * 100 * r.weight,
    0,
  );
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}
