'use client';

import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { studentsApi, riskAssessmentApi, recommendationsApi } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { KpiCard } from '@/components/KpiCard';
import { RiskBadge } from '@/components/RiskBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { formatDate } from '@/lib/format';

async function loadDashboard() {
  const [students, high, medium, low, earlyWarnings] = await Promise.all([
    studentsApi.list({ limit: 1 }),
    riskAssessmentApi.atRisk('HIGH'),
    riskAssessmentApi.atRisk('MEDIUM'),
    riskAssessmentApi.atRisk('LOW'),
    recommendationsApi.pendingEarlyWarnings(),
  ]);
  return { students, high, medium, low, earlyWarnings };
}

export default function DashboardPage() {
  const { data, loading, error, refetch } = useApi(loadDashboard, []);

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

      {loading && <LoadingState label="Loading cohort summary…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Students tracked" value={String(data.students.total)} />
            <KpiCard
              label="High risk"
              value={String(data.high.length)}
              tone="high"
              hint="Latest classical + deep learning predictions"
            />
            <KpiCard
              label="Medium risk"
              value={String(data.medium.length)}
              tone="medium"
            />
            <KpiCard
              label="Pending early warnings"
              value={String(data.earlyWarnings.length)}
              tone={data.earlyWarnings.length > 0 ? 'high' : 'low'}
              hint="Recommendations awaiting action"
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
              <div className="h-64" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { level: 'Low', count: data.low.length, fill: '#5C7A4E' },
                      { level: 'Medium', count: data.medium.length, fill: '#C08A2E' },
                      { level: 'High', count: data.high.length, fill: '#B5432F' },
                    ]}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
                    <XAxis
                      dataKey="level"
                      tick={{ fill: '#5B5548', fontSize: 12 }}
                      axisLine={{ stroke: '#DED5BF' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#5B5548', fontSize: 12 }}
                      axisLine={{ stroke: '#DED5BF' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFDF8',
                        border: '1px solid #DED5BF',
                        borderRadius: 3,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="#2F6F62" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DataDisclosure
                caption="Number of students at each risk level"
                columns={['Risk level', 'Students']}
                rows={[
                  ['Low', data.low.length],
                  ['Medium', data.medium.length],
                  ['High', data.high.length],
                ]}
              />
            </div>
          </section>

          <section aria-labelledby="at-risk-heading">
            <h2
              id="at-risk-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              Students needing attention
            </h2>
            <div className="mt-3 overflow-x-auto rounded-card border border-line bg-surface shadow-card">
              {data.high.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No high-risk students right now"
                    description="Risk assessments are generated per student from the Student register."
                  />
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Students currently flagged as high risk
                  </caption>
                  <thead>
                    <tr className="border-b border-line bg-paper/60">
                      <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                        Student
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                        Programme
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                        Model
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                        Risk
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                        Assessed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.high.slice(0, 10).map((assessment) => (
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
        </>
      )}
    </div>
  );
}
