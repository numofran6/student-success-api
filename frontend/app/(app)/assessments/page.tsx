import { ClipboardList } from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import { getStudents, getAssessmentsByStudent, getAssessmentSummary } from '@/lib/server/api';
import { StudentPickerLink } from '@/components/StudentPickerLink';
import { KpiCard } from '@/components/KpiCard';
import { EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { AssessmentLineChart } from '@/components/charts/AssessmentLineChart';
import { formatDate, formatPercent, ASSESSMENT_TYPE_LABEL } from '@/lib/format';
import { DemoAssessmentsPage } from './DemoAssessmentsPage';

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  if (DEMO_MODE) return <DemoAssessmentsPage />;

  const studentId = searchParams.studentId;
  const [{ data: students }, records, summary] = await Promise.all([
    getStudents({ limit: 100 }),
    studentId ? getAssessmentsByStudent(studentId) : Promise.resolve(null),
    studentId ? getAssessmentSummary(studentId) : Promise.resolve(null),
  ]);

  const student = students.find((s) => s.id === studentId) ?? null;

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

      <StudentPickerLink students={students} selectedId={studentId} basePath="/assessments" />

      {!student && (
        <EmptyState
          title="No student selected"
          description="Use the picker above to load assessment data for a student."
        />
      )}

      {student && records && summary && (
        <>
          <KpiCard
            label="Weighted average score"
            value={formatPercent(summary.weightedAveragePercentage)}
            hint={`${summary.assessmentCount} assessments recorded`}
            icon={ClipboardList}
          />

          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            {records.length === 0 ? (
              <EmptyState title="No assessment records for this student" />
            ) : (
              <>
                <AssessmentLineChart
                  data={records
                    .slice()
                    .reverse()
                    .map((r) => ({
                      date: formatDate(r.submittedAt),
                      percentage: Math.round((Number(r.score) / Number(r.maxScore)) * 1000) / 10,
                    }))}
                />

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
                      {records.map((r) => (
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
                  rows={records
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
