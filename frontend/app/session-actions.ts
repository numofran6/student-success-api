'use server';

import { redirect } from 'next/navigation';
import { verifyPassword } from '@/lib/server/api';
import { clearSessionKey, setSessionKey } from '@/lib/server/session';

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get('password') ?? '');
  if (!password) {
    return { error: 'Enter the staff access password.' };
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    return {
      error:
        'Incorrect password — check the API_KEY value with whoever set up the backend.',
    };
  }

  setSessionKey(password);
  redirect('/');
}

export async function logout(): Promise<void> {
  clearSessionKey();
  redirect('/login');
}
