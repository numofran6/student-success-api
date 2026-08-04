import type { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * Shared shell for the sign-in and sign-up screens: a brand panel on one
 * side, the actual form on white on the other — replacing a single centred
 * card with something that reads as a designed entry point rather than a
 * generic auth form.
 */
export function AuthSplitLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-primary-darker lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14) 0, transparent 45%), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.12) 0, transparent 40%)',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <p className="font-display text-lg font-bold text-white">Student Success</p>
        </div>
        <div className="relative max-w-sm">
          <p className="font-display text-3xl font-bold leading-tight text-white">
            Catch academic risk before it becomes a trend.
          </p>
          <p className="mt-4 font-sans text-sm text-white/70">
            Attendance, assessment, and engagement data — combined with
            classical and deep-learning risk models — in one dashboard for
            academic staff.
          </p>
        </div>
        <p className="relative font-mono text-xs uppercase tracking-wide text-white/40">
          AI-powered student success analytics
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{eyebrow}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1.5 font-sans text-sm text-ink-soft">{description}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-5">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
