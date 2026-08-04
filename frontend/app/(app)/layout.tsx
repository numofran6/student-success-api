import type { ReactNode } from 'react';
import { DEMO_MODE } from '@/lib/demo';
import { getCurrentUser } from '@/lib/server/api';
import { AppShell } from '@/components/AppShell';

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const user = DEMO_MODE ? null : await getCurrentUser();
  return <AppShell user={user}>{children}</AppShell>;
}
