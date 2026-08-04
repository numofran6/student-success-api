import clsx from 'clsx';

export function KpiCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'high' | 'medium' | 'low';
}) {
  const toneClasses: Record<string, string> = {
    neutral: 'border-line',
    high: 'border-risk-high/40',
    medium: 'border-risk-medium/40',
    low: 'border-risk-low/40',
  };

  return (
    <div
      className={clsx(
        'rounded-card border bg-surface p-4 shadow-card',
        toneClasses[tone],
      )}
    >
      <dt className="font-sans text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-2xl font-semibold text-ink">
        {value}
      </dd>
      {hint && <p className="mt-1 font-sans text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
