import Link from 'next/link';
import { DEMO_MODE } from '@/lib/demo';
import { getStudents, getRiskAssessmentsByStudent } from '@/lib/server/api';
import { EmptyState } from '@/components/StatusStates';
import { RiskCell } from '@/components/RiskCell';
import { Button } from '@/components/ui/button';
import { DemoStudentsPage } from './DemoStudentsPage';

const PAGE_SIZE = 20;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { programme?: string; cohortYear?: string; page?: string };
}) {
  if (DEMO_MODE) return <DemoStudentsPage />;

  const programme = searchParams.programme ?? '';
  const cohortYear = searchParams.cohortYear ?? '';
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);

  const data = await getStudents({
    programme: programme || undefined,
    cohortYear: cohortYear ? Number(cohortYear) : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const riskByStudent = await Promise.all(
    data.data.map((s) => getRiskAssessmentsByStudent(s.id)),
  );

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (programme) params.set('programme', programme);
    if (cohortYear) params.set('cohortYear', cohortYear);
    params.set('page', String(targetPage));
    return `/students?${params.toString()}`;
  }

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
        method="GET"
        role="search"
        aria-label="Filter students"
        className="flex flex-wrap items-end gap-4 rounded-card border border-line bg-surface p-4 shadow-card"
      >
        <div>
          <label htmlFor="programme-filter" className="block font-sans text-sm font-medium text-ink">
            Programme
          </label>
          <input
            id="programme-filter"
            name="programme"
            type="text"
            defaultValue={programme}
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
            name="cohortYear"
            type="number"
            inputMode="numeric"
            defaultValue={cohortYear}
            placeholder="e.g. 2024"
            className="mt-1.5 w-32 rounded-card border border-line bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        <Button type="submit" variant="outline">
          Apply filters
        </Button>
        {(programme || cohortYear) && (
          <Button asChild variant="ghost">
            <Link href="/students">Clear filters</Link>
          </Button>
        )}
      </form>

      {data.data.length === 0 && (
        <EmptyState
          title="No students match these filters"
          description="Try clearing the programme or cohort year filter."
        />
      )}

      {data.data.length > 0 && (
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
              {data.data.map((student, i) => (
                <tr key={student.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-ink">
                    {student.externalId}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{student.programme ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                    {student.cohortYear ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <RiskCell assessments={riskByStudent[i]} />
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
          <nav
            aria-label="Pagination"
            className="flex items-center justify-between border-t border-line px-4 py-3"
          >
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(page - 1)}>Previous</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            )}
            <p className="font-sans text-sm text-ink-soft" aria-live="polite">
              Page {page} of {totalPages}
            </p>
            {page < totalPages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(page + 1)}>Next</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
