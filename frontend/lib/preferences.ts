const PAGE_SIZE_KEY = 'student-success:default-page-size';
const COMPACT_KEY = 'student-success:compact-mode';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 20;

export function getStoredPageSize(): number {
  if (typeof window === 'undefined') return DEFAULT_PAGE_SIZE;
  const raw = window.localStorage.getItem(PAGE_SIZE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE_SIZE;
}

export function setStoredPageSize(value: number): void {
  window.localStorage.setItem(PAGE_SIZE_KEY, String(value));
}

export function getStoredCompactMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(COMPACT_KEY) === 'true';
}

/**
 * Persists the compact-mode preference and applies it immediately by
 * toggling a class on <html>. Compact mode works by slightly shrinking the
 * root font size — since this app's spacing is all rem-based Tailwind
 * utilities, that shrinks paddings, gaps, and text together, site-wide,
 * without needing every component to know about it.
 */
export function setCompactMode(value: boolean): void {
  window.localStorage.setItem(COMPACT_KEY, String(value));
  document.documentElement.classList.toggle('compact', value);
}

export function applyStoredCompactMode(): void {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.toggle('compact', getStoredCompactMode());
}
