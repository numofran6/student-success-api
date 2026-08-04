'use server';

import { redirect } from 'next/navigation';
import { login as loginRequest, signup as signupRequest } from '@/lib/server/api';
import { clearSessionKey, setSessionKey } from '@/lib/server/session';

export interface AuthFormState {
  error?: string;
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  const result = await loginRequest({ email, password });
  if ('error' in result) {
    return { error: result.error };
  }

  setSessionKey(result.token);
  redirect('/');
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();

  if (!email || !password || !firstName || !lastName) {
    return { error: 'Fill in your first name, last name, email, and password.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const result = await signupRequest({ email, password, firstName, lastName });
  if ('error' in result) {
    return { error: result.error };
  }

  setSessionKey(result.token);
  redirect('/');
}

export async function logout(): Promise<void> {
  clearSessionKey();
  redirect('/login');
}
