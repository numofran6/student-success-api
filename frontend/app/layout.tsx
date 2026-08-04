import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LoginGate } from '@/components/LoginGate';
import { AppShell } from '@/components/AppShell';

// Standard Tailwind-style look uses a single plain sans font throughout —
// no separate serif "display" face. font-display and font-sans (in
// tailwind.config.ts) both point at this same variable.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

// Every page here depends on the signed-in session and live backend data,
// so there is nothing worth statically prerendering.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Student Success Analytics',
  description:
    'AI-powered student success analytics platform: attendance, assessment, engagement, and academic risk in one dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <LoginGate>
            <AppShell>{children}</AppShell>
          </LoginGate>
        </AuthProvider>
      </body>
    </html>
  );
}
