'use client';

import { useId, useMemo, useState } from 'react';
import { studentsApi } from '@/lib/demo-api';
import { useApi } from '@/lib/use-api';
import type { Student } from '@/lib/types';
import { LoadingState, ErrorState } from './StatusStates';

export function StudentPicker({
  onSelect,
  selected,
}: {
  onSelect: (student: Student) => void;
  selected: Student | null;
}) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const { data, loading, error, refetch } = useApi(
    () => studentsApi.list({ limit: 100 }),
    [],
  );

  const optionLabel = (s: Student) =>
    `${s.externalId}${s.programme ? ` — ${s.programme}` : ''}`;

  const byLabel = useMemo(() => {
    const map = new Map<string, Student>();
    data?.data.forEach((s) => map.set(optionLabel(s), s));
    return map;
  }, [data]);

  if (loading) return <LoadingState label="Loading student list…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="max-w-md">
      <label
        htmlFor="student-picker-input"
        className="block font-sans text-sm font-medium text-ink"
      >
        Choose a student
      </label>
      <input
        id="student-picker-input"
        list={listId}
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          const match = byLabel.get(value);
          if (match) onSelect(match);
        }}
        placeholder="Start typing a student ID…"
        className="mt-1.5 w-full rounded-card border border-line bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <datalist id={listId}>
        {data?.data.map((s) => (
          <option key={s.id} value={optionLabel(s)} />
        ))}
      </datalist>
      {selected && (
        <p className="mt-2 font-sans text-xs text-ink-soft">
          Viewing <span className="font-medium text-ink">{selected.externalId}</span>
        </p>
      )}
    </div>
  );
}
