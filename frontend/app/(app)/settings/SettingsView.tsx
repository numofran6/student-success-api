'use client';

import { useEffect, useState } from 'react';
import { logout } from '@/app/session-actions';
import { DEMO_MODE } from '@/lib/demo';
import type { CurrentUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  getStoredCompactMode,
  getStoredPageSize,
  setCompactMode,
  setStoredPageSize,
} from '@/lib/preferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function SettingsView({ user }: { user: CurrentUser | null }) {
  const [compact, setCompact] = useState(false);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [saved, setSaved] = useState(false);

  // Read persisted values only after mount (avoids any server/client mismatch,
  // since these live in the browser's localStorage).
  useEffect(() => {
    setCompact(getStoredCompactMode());
    setPageSize(getStoredPageSize());
  }, []);

  function handleCompactChange(value: boolean) {
    setCompact(value);
    setCompactMode(value);
    flashSaved();
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setStoredPageSize(value);
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Settings</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Preferences</h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-ink-soft">
          These are saved in this browser only, so they won&apos;t follow you
          to another device yet.
        </p>
      </header>

      <Tabs defaultValue="display">
        <TabsList>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>
                Adjust density and default list size across the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="compact-mode">Compact tables</Label>
                  <p className="mt-0.5 font-sans text-xs text-ink-soft">
                    Slightly reduces spacing and text size throughout the app.
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={compact}
                  onCheckedChange={handleCompactChange}
                />
              </div>

              <Separator />

              <div>
                <Label id="page-size-label">Default rows per page</Label>
                <p className="mt-0.5 font-sans text-xs text-ink-soft">
                  Used as the starting page size on the student register.
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby="page-size-label"
                  className="mt-2.5 flex gap-2"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={pageSize === option}
                      onClick={() => handlePageSizeChange(option)}
                      className={
                        pageSize === option
                          ? 'rounded-md bg-primary px-3 py-1.5 font-sans text-sm font-medium text-primary-foreground'
                          : 'rounded-md border border-border px-3 py-1.5 font-sans text-sm font-medium text-ink-soft hover:bg-paper'
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <p
                aria-live="polite"
                className="font-sans text-xs text-primary-dark"
              >
                {saved ? 'Saved.' : '\u00A0'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                {DEMO_MODE
                  ? 'You are viewing demo mode — this is a placeholder account, not a real sign-in.'
                  : `Signed in as ${user?.email ?? ''}.`}
              </CardDescription>
            </CardHeader>
            {!DEMO_MODE && (
              <CardContent>
                <Button variant="outline" onClick={() => logout()}>
                  Sign out
                </Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
