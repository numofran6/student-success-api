import Link from 'next/link';
import { DEMO_MODE } from '@/lib/demo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Student Success Analytics
          </p>
          <CardTitle className="mt-1 text-2xl">Staff access</CardTitle>
          <CardDescription>
            {DEMO_MODE
              ? 'Demo mode is on — no sign-in needed.'
              : 'Enter the staff access password to view cohort risk, attendance, and engagement records.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {DEMO_MODE ? (
            <Button asChild className="w-full">
              <Link href="/">Continue to the dashboard</Link>
            </Button>
          ) : (
            <LoginForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
