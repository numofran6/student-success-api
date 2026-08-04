'use client';

import Link from 'next/link';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DEMO_MODE } from '@/lib/demo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const { unlocked, logout } = useAuth();

  if (!unlocked) return null;

  const label = DEMO_MODE ? 'Demo staff account' : 'Staff account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-transparent p-1 pr-2 hover:border-line hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Account menu for ${label}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[9rem] truncate font-sans text-sm font-medium text-ink sm:block">
            {label}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="normal-case tracking-normal text-ink">
          <span className="block truncate font-medium">{label}</span>
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
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
