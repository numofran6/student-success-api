'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { engagementApi } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { StudentPicker } from '@/components/StudentPicker';
import { KpiCard } from '@/components/KpiCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { formatDate } from '@/lib/format';
import type { Student } from '@/lib/types';

export default function EngagementPage() {
  const [student, setStudent] = useState<Student | null>(null);

  const { data, loading, error, refetch } = useApi(async () => {
    if (!student) return null;
    const [records, summary] = await Promise.all([
      engagementApi.listByStudent(student.id),
      engagementApi.summary(student.id),
    ]);
    return { records, summary };
  }, [student?.id]);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Engagement
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          VLE engagement records
        </h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          Select a student to see logins, clicks, forum activity, and resource
          access over time.
        </p>
      </header>

      <StudentPicker selected={student} onSelect={setStudent} />

      {!student && (
        <EmptyState
          title="No student selected"
          description="Use the picker above to load engagement data for a student."
        />
      )}

      {student && loading && <LoadingState label="Loading engagement…" />}
      {student && error && <ErrorState message={error} onRetry={refetch} />}

      {student && data && (
        <>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="VLE clicks" value={String(data.summary.totalVleClicks)} />
            <KpiCard label="Logins" value={String(data.summary.totalLoginCount)} />
            <KpiCard label="Forum posts" value={String(data.summary.totalForumPosts)} />
            <KpiCard label="Resource accesses" value={String(data.summary.totalResourceAccessCount)} />
          </dl>

          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            {data.records.length === 0 ? (
              <EmptyState title="No engagement records for this student" />
            ) : (
              <>
                <div className="h-56" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.records
                        .slice()
                        .reverse()
                        .map((r) => ({
                          period: formatDate(r.periodStart),
                          clicks: r.vleClicks,
                          logins: r.loginCount,
                          forum: r.forumPosts,
                        }))}
                      margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
                      <XAxis dataKey="period" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                      <YAxis tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #DED5BF', borderRadius: 3, fontSize: 12 }} />
                      <Bar dataKey="clicks" fill="#2F6F62" name="VLE clicks" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="logins" fill="#6E8B5E" name="Logins" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="forum" fill="#C08A2E" name="Forum posts" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <caption className="sr-only">
                      Engagement records for {student.externalId}
                    </caption>
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Course</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Period</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Clicks</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Logins</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Forum</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Resources</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.records.map((r) => (
                        <tr key={r.id} className="border-b border-line/60 last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs">{r.courseCode}</td>
                          <td className="py-2 pr-4 font-mono text-xs text-ink-soft">
                            {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs">{r.vleClicks}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{r.loginCount}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{r.forumPosts}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{r.resourceAccessCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DataDisclosure
                  caption="Engagement activity by period"
                  columns={['Period', 'VLE clicks', 'Logins', 'Forum posts']}
                  rows={data.records
                    .slice()
                    .reverse()
                    .map((r) => [formatDate(r.periodStart), r.vleClicks, r.loginCount, r.forumPosts])}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
