// Deterministic colour-from-string, so a student's avatar is always the same
// colour across pages without needing to store one. Anonymised student data
// has no photo, so a coloured initial stands in for a face — the same device
// the reference dashboard's user-grid and datatable views lean on heavily.

const AVATAR_PALETTE = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
] as const;

export function avatarColorFor(seed: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
