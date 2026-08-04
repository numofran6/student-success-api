import Link from 'next/link';
import { Settings } from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import { getCurrentUser } from '@/lib/server/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ProfilePage() {
  const user = DEMO_MODE ? null : await getCurrentUser();

  const displayName = DEMO_MODE ? 'Demo staff account' : `${user!.firstName} ${user!.lastName}`;
  const initials = DEMO_MODE
    ? 'SA'
    : `${user!.firstName[0] ?? ''}${user!.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-xl space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Profile</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Your account</h1>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>{DEMO_MODE ? 'Sample account' : user!.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-sans text-sm text-ink-soft">
            {DEMO_MODE
              ? "This is a placeholder profile shown in demo mode — it isn't a real signed-in account."
              : 'Your name and email are shown here from your staff account. There are no other profile fields to manage yet.'}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/settings">
              <Settings /> Go to settings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
