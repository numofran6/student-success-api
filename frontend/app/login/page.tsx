import Link from 'next/link';
import { DEMO_MODE } from '@/lib/demo';
import { AuthSplitLayout } from '@/components/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <AuthSplitLayout
      eyebrow="Student Success Analytics"
      title="Sign in"
      description={
        DEMO_MODE
          ? 'Demo mode is on — no sign-in needed.'
          : 'Sign in with your staff account to view cohort risk, attendance, and engagement records.'
      }
      footer={
        !DEMO_MODE && (
          <p className="font-sans text-sm text-ink-soft">
            No account yet?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create one
            </Link>
          </p>
        )
      }
    >
      {DEMO_MODE ? (
        <Button asChild className="w-full">
          <Link href="/">Continue to the dashboard</Link>
        </Button>
      ) : (
        <LoginForm />
      )}
    </AuthSplitLayout>
  );
}
