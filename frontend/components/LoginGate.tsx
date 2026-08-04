'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoadingState } from './StatusStates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';

export function LoginGate({ children }: { children: ReactNode }) {
  const { unlocked, loading, error, login } = useAuth();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  if (!unlocked) {
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      setSubmitting(true);
      await login(password);
      setSubmitting(false);
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
              Student Success Analytics
            </p>
            <CardTitle className="mt-1 text-2xl">Staff access</CardTitle>
            <CardDescription>
              Enter the staff access password to view cohort risk, attendance,
              and engagement records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <input
                  id="password"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !password}>
                <Lock /> {submitting ? 'Checking…' : 'Unlock'}
              </Button>
              {error && (
                <p role="alert" className="font-sans text-sm text-destructive">
                  {error}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
