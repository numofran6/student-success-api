import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

const TONE_STYLES: Record<string, { badge: string; icon: string }> = {
  neutral: { badge: 'bg-primary-light', icon: 'text-primary' },
  high: { badge: 'bg-risk-high-bg', icon: 'text-risk-high' },
  medium: { badge: 'bg-risk-medium-bg', icon: 'text-risk-medium' },
  low: { badge: 'bg-risk-low-bg', icon: 'text-risk-low' },
};

export function KpiCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'high' | 'medium' | 'low';
  icon?: LucideIcon;
}) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <dt className="font-sans text-xs font-medium uppercase tracking-wide text-ink-faint">
            {label}
          </dt>
          <dd className="mt-1.5 font-display text-2xl font-bold text-ink">{value}</dd>
        </div>
        {Icon && (
          <span
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              toneStyle.badge,
            )}
          >
            <Icon className={clsx('h-5 w-5', toneStyle.icon)} aria-hidden="true" />
          </span>
        )}
      </div>
      {hint && <p className="mt-2 font-sans text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
