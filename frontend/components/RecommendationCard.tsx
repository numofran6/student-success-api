'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/StatusPill';
import { formatDateTime } from '@/lib/format';
import type { Recommendation, RecommendationStatus } from '@/lib/types';

export function RecommendationCard({
  recommendation,
  onStatusChange,
  studentHref,
  highlight = false,
}: {
  recommendation: Recommendation;
  onStatusChange: (
    id: string,
    status: RecommendationStatus,
  ) => Promise<{ error?: string }>;
  studentHref?: string;
  highlight?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(status: RecommendationStatus) {
    setError(null);
    startTransition(async () => {
      const result = await onStatusChange(recommendation.id, status);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div
      className={
        highlight
          ? 'rounded-card border border-risk-high/30 bg-risk-high-bg/40 p-4 shadow-card'
          : 'rounded-card border border-line bg-surface p-4 shadow-card'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
            {recommendation.type === 'EARLY_WARNING' ? 'Early warning' : 'Guidance'} ·{' '}
            {formatDateTime(recommendation.createdAt)}
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold text-ink">
            {recommendation.title}
          </h3>
          {studentHref && recommendation.student && (
            <Link
              href={studentHref}
              className="mt-0.5 inline-block font-sans text-sm font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {recommendation.student.externalId}
            </Link>
          )}
        </div>
        <StatusPill status={recommendation.status} />
      </div>
      <p className="mt-2 font-sans text-sm text-ink-soft">{recommendation.message}</p>
      <div className="mt-3 flex gap-2">
        {recommendation.status === 'PENDING' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleChange('ACKNOWLEDGED')}
            disabled={pending}
          >
            <Check /> Acknowledge
          </Button>
        )}
        {recommendation.status !== 'RESOLVED' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleChange('RESOLVED')}
            disabled={pending}
          >
            <CheckCheck /> Mark resolved
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 font-sans text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
