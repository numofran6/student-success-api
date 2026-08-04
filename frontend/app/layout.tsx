import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Standard Tailwind-style look uses a single plain sans font throughout —
// no separate serif "display" face. font-display and font-sans (in
// tailwind.config.ts) both point at this same variable.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

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
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
