'use client';

import { useState, useTransition } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/StatusStates';
import { StudentAvatar } from '@/components/StudentAvatar';
import { runRiskAssessmentAction, generateRecommendationsAction } from '@/app/actions';
import type { Student } from '@/lib/types';

export function StudentHeader({ student }: { student: Student }) {
  const [isRunningRisk, startRisk] = useTransition();
  const [isGeneratingRecs, startRecs] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRunRiskAssessment() {
    setError(null);
    startRisk(async () => {
      const result = await runRiskAssessmentAction(student.id);
      if (result.error) setError(result.error);
    });
  }

  function handleGenerateRecommendations() {
    setError(null);
    startRecs(async () => {
      const result = await generateRecommendationsAction(student.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <StudentAvatar externalId={student.externalId} size="lg" />
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
              Student profile
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">
              {student.externalId}
            </h1>
            <p className="mt-1 font-sans text-sm text-ink-soft">
              {student.programme ?? 'Programme not recorded'}
              {student.cohortYear ? ` · Cohort ${student.cohortYear}` : ''} · Source:{' '}
              {student.sourceDataset}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateRecommendations}
            disabled={isGeneratingRecs}
          >
            <Sparkles /> {isGeneratingRecs ? 'Generating…' : 'Generate recommendations'}
          </Button>
          <Button type="button" onClick={handleRunRiskAssessment} disabled={isRunningRisk}>
            <RefreshCw /> {isRunningRisk ? 'Running…' : 'Run risk assessment'}
          </Button>
        </div>
      </header>

      {error && <ErrorState message={error} />}
    </>
  );
}
