import type { RiskAssessment } from '@/lib/types';
import { RiskBadge } from './RiskBadge';
import { PulseStrip } from './PulseStrip';

/**
 * Presentational counterpart to StudentRiskCell — takes already-fetched
 * assessments as a prop instead of fetching per row, so a list of these can
 * be rendered from a single server-side batch of requests.
 */
export function RiskCell({ assessments }: { assessments: RiskAssessment[] }) {
  if (assessments.length === 0) {
    return <span className="font-sans text-xs text-ink-faint">Not assessed</span>;
  }

  const recent = [...assessments].slice(0, 6).reverse();
  const latest = assessments[0];

  return (
    <div className="flex items-center gap-3">
      <RiskBadge level={latest.riskLevel} />
      <PulseStrip
        scores={recent.map((r) => r.riskScore)}
        label={`Risk score trend, most recent ${recent.length} assessments, currently ${latest.riskLevel.toLowerCase()}`}
      />
    </div>
  );
}
