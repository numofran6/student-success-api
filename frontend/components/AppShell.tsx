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
} from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import { applyStoredCompactMode } from '@/lib/preferences';
import { UserMenu } from './UserMenu';

const NAV_ITEMS = [
  { href: '/', label: 'Cohort overview', icon: LayoutDashboard },
  { href: '/students', label: 'Student register', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/engagement', label: 'Engagement', icon: Activity },
  { href: '/recommendations', label: 'Recommendations', icon: Bell },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    applyStoredCompactMode();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink lg:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <nav
        aria-label="Primary"
        className="w-full shrink-0 border-b border-line bg-surface px-4 py-4 lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6"
      >
        <div className="flex items-center justify-between lg:block">
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-ink">
              Student Success
            </p>
            <p className="hidden font-mono text-xs uppercase tracking-wide text-ink-faint lg:block">
              Analytics Ledger
            </p>
          </div>
          {DEMO_MODE && (
            <span className="rounded-card border border-primary/30 bg-primary-light px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-primary-dark lg:hidden">
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
                    'flex items-center gap-2.5 rounded-card px-3 py-2 font-sans text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    active
                      ? 'bg-primary text-white'
                      : 'text-ink-soft hover:bg-primary-light hover:text-primary-dark',
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
          <div className="mt-6 hidden border-t border-line pt-4 lg:block">
            <div className="rounded-card border border-primary/30 bg-primary-light px-2.5 py-2">
              <p className="font-mono text-[0.65rem] uppercase tracking-wide text-primary-dark">
                Demo mode
              </p>
              <p className="mt-0.5 font-sans text-xs text-primary-dark">
                Viewing sample data only
              </p>
            </div>
          </div>
        )}
      </nav>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-line bg-surface px-4 py-2.5 lg:px-10">
          <UserMenu />
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
