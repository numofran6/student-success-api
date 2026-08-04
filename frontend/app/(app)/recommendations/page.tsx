import { DEMO_MODE } from '@/lib/demo';
import {
  getStudents,
  getPendingEarlyWarnings,
  getRecommendationsByStudent,
} from '@/lib/server/api';
import { StudentPickerLink } from '@/components/StudentPickerLink';
import { RecommendationCard } from '@/components/RecommendationCard';
import { EmptyState } from '@/components/StatusStates';
import { updateRecommendationStatusAction } from '@/app/actions';
import { DemoRecommendationsPage } from './DemoRecommendationsPage';

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  if (DEMO_MODE) return <DemoRecommendationsPage />;

  const studentId = searchParams.studentId;
  const [earlyWarnings, { data: students }, studentRecs] = await Promise.all([
    getPendingEarlyWarnings(),
    getStudents({ limit: 100 }),
    studentId ? getRecommendationsByStudent(studentId) : Promise.resolve(null),
  ]);

  const student = students.find((s) => s.id === studentId) ?? null;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Recommendations
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Guidance and early warnings
        </h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          Rule-based recommendations generated from each student&apos;s latest
          risk assessment.
        </p>
      </header>

      <section aria-labelledby="pending-warnings-heading">
        <h2 id="pending-warnings-heading" className="font-display text-xl font-semibold text-ink">
          Pending early warnings across the cohort
        </h2>

        {earlyWarnings.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No pending early warnings"
              description="Every early-warning recommendation has been actioned."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {earlyWarnings.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onStatusChange={updateRecommendationStatusAction}
                studentHref={rec.student ? `/students/${rec.studentId}` : undefined}
                highlight
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="student-recs-heading">
        <h2 id="student-recs-heading" className="font-display text-xl font-semibold text-ink">
          Look up a student&apos;s full recommendation history
        </h2>
        <div className="mt-3">
          <StudentPickerLink students={students} selectedId={studentId} basePath="/recommendations" />
        </div>

        {student && studentRecs && studentRecs.length === 0 && (
          <div className="mt-3">
            <EmptyState title={`No recommendations for ${student.externalId}`} />
          </div>
        )}
        {student && studentRecs && studentRecs.length > 0 && (
          <div className="mt-3 space-y-3">
            {studentRecs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onStatusChange={updateRecommendationStatusAction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
