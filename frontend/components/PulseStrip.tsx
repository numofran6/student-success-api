import { CHART_COLORS } from '@/lib/chart-colors';

interface PulseStripProps {
  /** Risk scores in chronological order, each between 0 and 1. */
  scores: number[];
  width?: number;
  height?: number;
  label: string;
}

/**
 * A small inline "ledger line" sparkline: risk scores plotted low-to-high
 * left-to-right, coloured by the trend's final value. Purely decorative —
 * always pair with the textual label passed in via `label` for screen readers.
 */
export function PulseStrip({
  scores,
  width = 96,
  height = 28,
  label,
}: PulseStripProps) {
  if (scores.length === 0) {
    return (
      <span className="font-sans text-xs text-ink-faint">No history yet</span>
    );
  }

  const padding = 3;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const step = scores.length > 1 ? usableWidth / (scores.length - 1) : 0;

  const points = scores.map((score, i) => {
    const x = padding + i * step;
    const y = padding + (1 - Math.min(Math.max(score, 0), 1)) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const last = scores[scores.length - 1];
  const stroke =
    last >= 0.66
      ? CHART_COLORS.risk.high
      : last >= 0.33
        ? CHART_COLORS.risk.medium
        : CHART_COLORS.risk.low;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="overflow-visible"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].split(',')[0]}
        cy={points[points.length - 1].split(',')[1]}
        r={2}
        fill={stroke}
      />
    </svg>
  );
}
