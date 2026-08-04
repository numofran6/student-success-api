import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'ss_session';

export function getSessionKey(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

export function setSessionKey(value: string): void {
  cookies().set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearSessionKey(): void {
  cookies().delete(SESSION_COOKIE);
}
