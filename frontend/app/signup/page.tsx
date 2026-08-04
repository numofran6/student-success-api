import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DEMO_MODE } from '@/lib/demo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  if (DEMO_MODE) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Student Success Analytics
          </p>
          <CardTitle className="mt-1 text-2xl">Create a staff account</CardTitle>
          <CardDescription>
            Sign up to view cohort risk, attendance, and engagement records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <p className="mt-4 font-sans text-sm text-ink-soft">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
