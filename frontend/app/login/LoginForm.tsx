'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Lock } from 'lucide-react';
import { login, type LoginState } from '@/app/session-actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Lock /> {pending ? 'Checking…' : 'Unlock'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction} className="space-y-3 text-left">
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
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
