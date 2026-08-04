import clsx from 'clsx';
import type { RecommendationStatus } from '@/lib/types';
import { RECOMMENDATION_STATUS_LABEL } from '@/lib/format';

const STYLES: Record<RecommendationStatus, string> = {
  PENDING: 'bg-risk-medium-bg text-risk-medium border-risk-medium/30',
  SENT: 'bg-primary-light text-primary-dark border-primary/30',
  ACKNOWLEDGED: 'bg-primary-light text-primary-dark border-primary/30',
  RESOLVED: 'bg-risk-low-bg text-risk-low border-risk-low/30',
};

export function StatusPill({ status }: { status: RecommendationStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-card border px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wide',
        STYLES[status],
      )}
    >
      {RECOMMENDATION_STATUS_LABEL[status]}
    </span>
  );
}
