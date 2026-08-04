import Link from 'next/link';
import { Users, AlertTriangle, AlertCircle, BellRing } from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import { getStudents, getAtRiskAssessments, getPendingEarlyWarnings } from '@/lib/server/api';
import { KpiCard } from '@/components/KpiCard';
import { RiskBadge } from '@/components/RiskBadge';
import { EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { formatDate } from '@/lib/format';
import { DemoDashboard } from './DemoDashboard';

export default async function DashboardPage() {
  if (DEMO_MODE) return <DemoDashboard />;

  const [students, high, medium, low, earlyWarnings] = await Promise.all([
    getStudents({ limit: 1 }),
    getAtRiskAssessments('HIGH'),
    getAtRiskAssessments('MEDIUM'),
    getAtRiskAssessments('LOW'),
    getPendingEarlyWarnings(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Cohort overview
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Student success ledger
        </h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          A live summary of academic risk across the cohort, drawn from
          attendance, assessment, and engagement records.
        </p>
      </header>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Students tracked" value={String(students.total)} icon={Users} />
        <KpiCard
          label="High risk"
          value={String(high.length)}
          tone="high"
          hint="Latest classical + deep learning predictions"
          icon={AlertTriangle}
        />
        <KpiCard
          label="Medium risk"
          value={String(medium.length)}
          tone="medium"
          icon={AlertCircle}
        />
        <KpiCard
          label="Pending early warnings"
          value={String(earlyWarnings.length)}
          tone={earlyWarnings.length > 0 ? 'high' : 'low'}
          hint="Recommendations awaiting action"
          icon={BellRing}
        />
      </dl>

      <section aria-labelledby="risk-distribution-heading">
        <h2
          id="risk-distribution-heading"
          className="font-display text-xl font-semibold text-ink"
        >
          Risk distribution
        </h2>
        <div className="mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <RiskDistributionChart low={low.length} medium={medium.length} high={high.length} />
          <DataDisclosure
            caption="Number of students at each risk level"
            columns={['Risk level', 'Students']}
            rows={[
              ['Low', low.length],
              ['Medium', medium.length],
              ['High', high.length],
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="at-risk-heading">
        <h2 id="at-risk-heading" className="font-display text-xl font-semibold text-ink">
          Students needing attention
        </h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-line bg-surface shadow-card">
          {high.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No high-risk students right now"
                description="Risk assessments are generated per student from the Student register."
              />
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Students currently flagged as high risk</caption>
              <thead>
                <tr className="border-b border-line bg-paper/60">
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">Student</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">Programme</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">Model</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">Risk</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">Assessed</th>
                </tr>
              </thead>
              <tbody>
                {high.slice(0, 10).map((assessment) => (
                  <tr key={assessment.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/students/${assessment.studentId}`}
                        className="font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {assessment.student?.externalId ?? assessment.studentId}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {assessment.student?.programme ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                      {assessment.modelType === 'CLASSICAL_ML' ? 'Classical ML' : 'Deep learning'}
                    </td>
                    <td className="px-4 py-2.5">
                      <RiskBadge level={assessment.riskLevel} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                      {formatDate(assessment.predictedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
