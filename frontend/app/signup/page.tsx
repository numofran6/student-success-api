import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DEMO_MODE } from '@/lib/demo';
import { AuthSplitLayout } from '@/components/AuthSplitLayout';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  if (DEMO_MODE) {
    redirect('/');
  }

  return (
    <AuthSplitLayout
      eyebrow="Student Success Analytics"
      title="Create a staff account"
      description="Sign up to view cohort risk, attendance, and engagement records."
      footer={
        <p className="font-sans text-sm text-ink-soft">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthSplitLayout>
  );
}
