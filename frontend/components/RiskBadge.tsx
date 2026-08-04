import clsx from 'clsx';
import type { RiskLevel } from '@/lib/types';
import { RISK_LABEL } from '@/lib/format';

const STYLES: Record<RiskLevel, string> = {
  HIGH: 'bg-risk-high-bg text-risk-high border-risk-high/30',
  MEDIUM: 'bg-risk-medium-bg text-risk-medium border-risk-medium/30',
  LOW: 'bg-risk-low-bg text-risk-low border-risk-low/30',
};

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-card border px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wide',
        STYLES[level],
        className,
      )}
    >
      <span aria-hidden="true" className="text-[0.6rem]">
        ●
      </span>
      {RISK_LABEL[level]}
    </span>
  );
}
