'use client';

import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { assessmentsApi } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { StudentPicker } from '@/components/StudentPicker';
import { KpiCard } from '@/components/KpiCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { formatDate, formatPercent, ASSESSMENT_TYPE_LABEL } from '@/lib/format';
import type { Student } from '@/lib/types';

export default function AssessmentsPage() {
  const [student, setStudent] = useState<Student | null>(null);

  const { data, loading, error, refetch } = useApi(async () => {
    if (!student) return null;
    const [records, summary] = await Promise.all([
      assessmentsApi.listByStudent(student.id),
      assessmentsApi.summary(student.id),
    ]);
    return { records, summary };
  }, [student?.id]);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Assessments
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Assessment records
        </h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          Select a student to see their quiz, coursework, exam, and project
          scores, weighted by assessment weight.
        </p>
      </header>

      <StudentPicker selected={student} onSelect={setStudent} />

      {!student && (
        <EmptyState
          title="No student selected"
          description="Use the picker above to load assessment data for a student."
        />
      )}

      {student && loading && <LoadingState label="Loading assessments…" />}
      {student && error && <ErrorState message={error} onRetry={refetch} />}

      {student && data && (
        <>
          <KpiCard
            label="Weighted average score"
            value={formatPercent(data.summary.weightedAveragePercentage)}
            hint={`${data.summary.assessmentCount} assessments recorded`}
          />

          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            {data.records.length === 0 ? (
              <EmptyState title="No assessment records for this student" />
            ) : (
              <>
                <div className="h-56" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.records
                        .slice()
                        .reverse()
                        .map((r) => ({
                          date: formatDate(r.submittedAt),
                          percentage:
                            Math.round((Number(r.score) / Number(r.maxScore)) * 1000) / 10,
                        }))}
                      margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
                      <XAxis dataKey="date" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                      <YAxis unit="%" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #DED5BF', borderRadius: 3, fontSize: 12 }} />
                      <Line type="monotone" dataKey="percentage" stroke="#C08A2E" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <caption className="sr-only">
                      Assessment records for {student.externalId}
                    </caption>
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Course</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Type</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Score</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Weight</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.records.map((r) => (
                        <tr key={r.id} className="border-b border-line/60 last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs">{r.courseCode}</td>
                          <td className="py-2 pr-4 text-ink-soft">{ASSESSMENT_TYPE_LABEL[r.type]}</td>
                          <td className="py-2 pr-4 font-mono text-xs">
                            {r.score}/{r.maxScore}
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs">{r.weight}×</td>
                          <td className="py-2 pr-4 font-mono text-xs text-ink-soft">{formatDate(r.submittedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DataDisclosure
                  caption="Assessment scores over time"
                  columns={['Date', 'Course', 'Type', 'Score (%)']}
                  rows={data.records
                    .slice()
                    .reverse()
                    .map((r) => [
                      formatDate(r.submittedAt),
                      r.courseCode,
                      ASSESSMENT_TYPE_LABEL[r.type],
                      Math.round((Number(r.score) / Number(r.maxScore)) * 1000) / 10,
                    ])}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
