'use client';

import { useState } from 'react';
import { recommendationsApi } from '@/lib/demo-api';
import { useApi } from '@/lib/use-api';
import { StudentPicker } from '@/components/StudentPicker';
import { RecommendationCard } from '@/components/RecommendationCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import type { Student, RecommendationStatus } from '@/lib/types';

export function DemoRecommendationsPage() {
  const [student, setStudent] = useState<Student | null>(null);

  const {
    data: earlyWarnings,
    loading: warningsLoading,
    error: warningsError,
    refetch: refetchWarnings,
  } = useApi(() => recommendationsApi.pendingEarlyWarnings(), []);

  const {
    data: studentRecs,
    loading: studentLoading,
    error: studentError,
    refetch: refetchStudentRecs,
  } = useApi(async () => {
    if (!student) return null;
    return recommendationsApi.listByStudent(student.id);
  }, [student?.id]);

  async function updateStatus(id: string, status: RecommendationStatus) {
    try {
      await recommendationsApi.updateStatus(id, status);
      refetchWarnings();
      refetchStudentRecs();
      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Could not update the recommendation.',
      };
    }
  }

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

        {warningsLoading && <LoadingState label="Loading early warnings…" />}
        {warningsError && <ErrorState message={warningsError} onRetry={refetchWarnings} />}

        {earlyWarnings && earlyWarnings.length === 0 && (
          <div className="mt-3">
            <EmptyState
              title="No pending early warnings"
              description="Every early-warning recommendation has been actioned."
            />
          </div>
        )}

        {earlyWarnings && earlyWarnings.length > 0 && (
          <div className="mt-3 space-y-3">
            {earlyWarnings.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onStatusChange={updateStatus}
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
          <StudentPicker selected={student} onSelect={setStudent} />
        </div>

        {student && studentLoading && (
          <div className="mt-3">
            <LoadingState label="Loading recommendations…" />
          </div>
        )}
        {student && studentError && (
          <div className="mt-3">
            <ErrorState message={studentError} onRetry={refetchStudentRecs} />
          </div>
        )}
        {student && studentRecs && studentRecs.length === 0 && (
          <div className="mt-3">
            <EmptyState title={`No recommendations for ${student.externalId}`} />
          </div>
        )}
        {student && studentRecs && studentRecs.length > 0 && (
          <div className="mt-3 space-y-3">
            {studentRecs.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} onStatusChange={updateStatus} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
