'use client';

import { useState } from 'react';
import Link from 'next/link';
import { recommendationsApi } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { StudentPicker } from '@/components/StudentPicker';
import { StatusPill } from '@/components/StatusPill';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { formatDateTime } from '@/lib/format';
import type { Student, RecommendationStatus } from '@/lib/types';

export default function RecommendationsPage() {
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
    await recommendationsApi.updateStatus(id, status);
    refetchWarnings();
    refetchStudentRecs();
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
              <div key={rec.id} className="rounded-card border border-risk-high/30 bg-risk-high-bg/40 p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
                      {formatDateTime(rec.createdAt)}
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-semibold text-ink">
                      {rec.title}
                    </h3>
                    {rec.student && (
                      <Link
                        href={`/students/${rec.studentId}`}
                        className="mt-0.5 inline-block font-sans text-sm font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {rec.student.externalId}
                      </Link>
                    )}
                  </div>
                  <StatusPill status={rec.status} />
                </div>
                <p className="mt-2 font-sans text-sm text-ink-soft">{rec.message}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(rec.id, 'ACKNOWLEDGED')}
                    className="rounded-card border border-line bg-surface px-2.5 py-1 font-sans text-xs font-medium text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(rec.id, 'RESOLVED')}
                    className="rounded-card border border-line bg-surface px-2.5 py-1 font-sans text-xs font-medium text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Mark resolved
                  </button>
                </div>
              </div>
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
              <div key={rec.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
                      {rec.type === 'EARLY_WARNING' ? 'Early warning' : 'Guidance'} · {formatDateTime(rec.createdAt)}
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-semibold text-ink">
                      {rec.title}
                    </h3>
                  </div>
                  <StatusPill status={rec.status} />
                </div>
                <p className="mt-2 font-sans text-sm text-ink-soft">{rec.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
