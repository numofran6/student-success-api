'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  Activity,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import { applyStoredCompactMode } from '@/lib/preferences';
import type { CurrentUser } from '@/lib/types';
import { UserMenu } from './UserMenu';

const NAV_ITEMS = [
  { href: '/', label: 'Cohort overview', icon: LayoutDashboard },
  { href: '/students', label: 'Student register', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/engagement', label: 'Engagement', icon: Activity },
  { href: '/recommendations', label: 'Recommendations', icon: Bell },
];

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user?: CurrentUser | null;
}) {
  const pathname = usePathname();

  useEffect(() => {
    applyStoredCompactMode();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink lg:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <nav
        aria-label="Primary"
        className="w-full shrink-0 bg-primary-darker px-4 py-4 lg:w-64 lg:px-5 lg:py-6"
      >
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-base font-bold leading-tight text-white">
                Student Success
              </p>
              <p className="hidden font-mono text-[0.65rem] uppercase tracking-wide text-white/50 lg:block">
                Analytics Ledger
              </p>
            </div>
          </div>
          {DEMO_MODE && (
            <span className="rounded-full bg-white/15 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-white lg:hidden">
              Demo
            </span>
          )}
        </div>

        <ul className="mt-5 flex flex-wrap gap-1 lg:mt-8 lg:flex-col lg:gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'flex items-center gap-2.5 rounded-full px-3.5 py-2 font-sans text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                    active
                      ? 'bg-white text-primary-darker shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {DEMO_MODE && (
          <div className="mt-6 hidden border-t border-white/15 pt-4 lg:block">
            <div className="rounded-card bg-white/10 px-2.5 py-2">
              <p className="font-mono text-[0.65rem] uppercase tracking-wide text-white">
                Demo mode
              </p>
              <p className="mt-0.5 font-sans text-xs text-white/70">
                Viewing sample data only
              </p>
            </div>
          </div>
        )}
      </nav>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-line bg-surface px-4 py-2.5 lg:px-10">
          <UserMenu user={user} />
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
