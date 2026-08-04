'use client';

import Link from 'next/link';
import { useState } from 'react';
import { studentsApi } from '@/lib/demo-api';
import { useApi } from '@/lib/use-api';
import { getStoredPageSize } from '@/lib/preferences';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { Pagination } from '@/components/Pagination';
import { StudentRiskCell } from '@/components/StudentRiskCell';

export function DemoStudentsPage() {
  const [programme, setProgramme] = useState('');
  const [cohortYear, setCohortYear] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(() => getStoredPageSize());

  const { data, loading, error, refetch } = useApi(
    () =>
      studentsApi.list({
        programme: programme || undefined,
        cohortYear: cohortYear ? Number(cohortYear) : undefined,
        page,
        limit: pageSize,
      }),
    [programme, cohortYear, page, pageSize],
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Student register
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          All students
        </h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          Browse the anonymised student cohort. Select a student to view their
          full attendance, assessment, engagement, and risk history.
        </p>
      </header>

      <form
        role="search"
        aria-label="Filter students"
        className="flex flex-wrap items-end gap-4 rounded-card border border-line bg-surface p-4 shadow-card"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="programme-filter" className="block font-sans text-sm font-medium text-ink">
            Programme
          </label>
          <input
            id="programme-filter"
            type="text"
            value={programme}
            onChange={(e) => {
              setPage(1);
              setProgramme(e.target.value);
            }}
            placeholder="e.g. BSc Computing"
            className="mt-1.5 w-56 rounded-card border border-line bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        <div>
          <label htmlFor="cohort-filter" className="block font-sans text-sm font-medium text-ink">
            Cohort year
          </label>
          <input
            id="cohort-filter"
            type="number"
            inputMode="numeric"
            value={cohortYear}
            onChange={(e) => {
              setPage(1);
              setCohortYear(e.target.value);
            }}
            placeholder="e.g. 2024"
            className="mt-1.5 w-32 rounded-card border border-line bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        {(programme || cohortYear) && (
          <button
            type="button"
            onClick={() => {
              setProgramme('');
              setCohortYear('');
              setPage(1);
            }}
            className="rounded-card border border-line px-3 py-2 font-sans text-sm font-medium text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Clear filters
          </button>
        )}
      </form>

      {loading && <LoadingState label="Loading students…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && data.data.length === 0 && (
        <EmptyState
          title="No students match these filters"
          description="Try clearing the programme or cohort year filter."
        />
      )}

      {data && data.data.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Student register</caption>
            <thead>
              <tr className="border-b border-line bg-paper/60">
                <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                  External ID
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                  Programme
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                  Cohort
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                  Risk trend
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium text-ink-soft">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((student) => (
                <tr key={student.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-ink">
                    {student.externalId}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {student.programme ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                    {student.cohortYear ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <StudentRiskCell studentId={student.id} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-sans text-sm font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      View profile
                      <span className="sr-only"> for {student.externalId}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
