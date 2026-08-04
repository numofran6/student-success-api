'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { UserPlus } from 'lucide-react';
import { signup } from '@/app/session-actions';
import type { AuthFormState } from '@/app/session-actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <UserPlus /> {pending ? 'Creating account…' : 'Create account'}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <form action={formAction} className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">First name</Label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            autoFocus
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last name</Label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
        <p className="font-sans text-xs text-ink-faint">At least 8 characters.</p>
      </div>
      <SubmitButton />
      {state.error && (
        <p role="alert" className="font-sans text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
