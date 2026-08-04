const STORAGE_KEY = 'student-success:api-key';

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setApiKey(key: string): void {
  window.localStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
