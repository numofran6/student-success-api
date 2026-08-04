'use client';

import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { attendanceApi } from '@/lib/demo-api';
import { useApi } from '@/lib/use-api';
import { StudentPicker } from '@/components/StudentPicker';
import { KpiCard } from '@/components/KpiCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { AttendanceLineChart } from '@/components/charts/AttendanceLineChart';
import { formatDate, formatPercent } from '@/lib/format';
import type { Student } from '@/lib/types';

export function DemoAttendancePage() {
  const [student, setStudent] = useState<Student | null>(null);

  const { data, loading, error, refetch } = useApi(async () => {
    if (!student) return null;
    const [records, summary] = await Promise.all([
      attendanceApi.listByStudent(student.id),
      attendanceApi.summary(student.id),
    ]);
    return { records, summary };
  }, [student?.id]);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Attendance
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Attendance records
        </h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          Select a student to see their session-by-session attendance and
          overall rate.
        </p>
      </header>

      <StudentPicker selected={student} onSelect={setStudent} />

      {!student && (
        <EmptyState
          title="No student selected"
          description="Use the picker above to load attendance data for a student."
        />
      )}

      {student && loading && <LoadingState label="Loading attendance…" />}
      {student && error && <ErrorState message={error} onRetry={refetch} />}

      {student && data && (
        <>
          <KpiCard
            label="Average attendance rate"
            value={formatPercent(data.summary.averageAttendanceRate)}
            hint={`${data.summary.totalSessionsAttended} of ${data.summary.totalSessionsScheduled} sessions attended`}
            icon={CalendarCheck}
          />

          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            {data.records.length === 0 ? (
              <EmptyState title="No attendance records for this student" />
            ) : (
              <>
                <AttendanceLineChart
                  data={data.records
                    .slice()
                    .reverse()
                    .map((r) => ({ date: formatDate(r.recordedAt), rate: Number(r.attendanceRate) }))}
                />

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <caption className="sr-only">
                      Attendance records for {student.externalId}
                    </caption>
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Course</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Term</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Attended / Scheduled</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Rate</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink-soft">Recorded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.records.map((r) => (
                        <tr key={r.id} className="border-b border-line/60 last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs">{r.courseCode}</td>
                          <td className="py-2 pr-4 text-ink-soft">{r.term}</td>
                          <td className="py-2 pr-4 font-mono text-xs">
                            {r.sessionsAttended}/{r.sessionsScheduled}
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs">{formatPercent(Number(r.attendanceRate))}</td>
                          <td className="py-2 pr-4 font-mono text-xs text-ink-soft">{formatDate(r.recordedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DataDisclosure
                  caption="Attendance rate over time"
                  columns={['Date', 'Attendance rate (%)']}
                  rows={data.records
                    .slice()
                    .reverse()
                    .map((r) => [formatDate(r.recordedAt), Number(r.attendanceRate)])}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
