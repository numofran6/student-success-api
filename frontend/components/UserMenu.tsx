import Link from 'next/link';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import { logout } from '@/app/session-actions';
import type { CurrentUser } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function initials(user: CurrentUser): string {
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'SA';
}

export function UserMenu({ user }: { user?: CurrentUser | null }) {
  const label = DEMO_MODE
    ? 'Demo staff account'
    : user
      ? `${user.firstName} ${user.lastName}`
      : 'Staff account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-transparent p-1 pr-2 hover:border-line hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Account menu for ${label}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user ? initials(user) : 'SA'}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[9rem] truncate font-sans text-sm font-medium text-ink sm:block">
            {label}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="normal-case tracking-normal text-ink">
          <span className="block truncate font-medium">{label}</span>
          {!DEMO_MODE && user && (
            <span className="block truncate font-normal text-ink-faint">{user.email}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        {!DEMO_MODE && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logout} className="w-full">
                <button type="submit" className="flex w-full items-center gap-2">
                  <LogOut /> Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
