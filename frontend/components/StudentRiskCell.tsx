'use client';

import { riskAssessmentApi } from '@/lib/demo-api';
import { useApi } from '@/lib/use-api';
import { RiskBadge } from './RiskBadge';
import { PulseStrip } from './PulseStrip';

export function StudentRiskCell({ studentId }: { studentId: string }) {
  const { data, loading } = useApi(
    () => riskAssessmentApi.listByStudent(studentId),
    [studentId],
  );

  if (loading) {
    return <span className="font-sans text-xs text-ink-faint">Loading…</span>;
  }

  if (!data || data.length === 0) {
    return <span className="font-sans text-xs text-ink-faint">Not assessed</span>;
  }

  // Assessments come back newest-first; take the most recent few and
  // reverse them so the sparkline reads chronologically, left to right.
  const recent = [...data].slice(0, 6).reverse();
  const latest = data[0];

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
