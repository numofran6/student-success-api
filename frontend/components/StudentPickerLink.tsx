'use client';

import { useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Student } from '@/lib/types';

/**
 * SSR-friendly student picker: the list of students is preloaded server-side
 * and passed in as a prop (no client-side fetch), and selecting a student
 * navigates to `${basePath}?studentId=...` so the destination page can fetch
 * that student's data server-side too.
 */
export function StudentPickerLink({
  students,
  selectedId,
  basePath,
}: {
  students: Student[];
  selectedId?: string;
  basePath: string;
}) {
  const listId = useId();
  const router = useRouter();
  const selected = students.find((s) => s.id === selectedId) ?? null;
  const [query, setQuery] = useState('');

  const optionLabel = (s: Student) =>
    `${s.externalId}${s.programme ? ` — ${s.programme}` : ''}`;

  const byLabel = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(optionLabel(s), s));
    return map;
  }, [students]);

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
          if (match) router.push(`${basePath}?studentId=${match.id}`);
        }}
        placeholder="Start typing a student ID…"
        className="mt-1.5 w-full rounded-card border border-line bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <datalist id={listId}>
        {students.map((s) => (
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
