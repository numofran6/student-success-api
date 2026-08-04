import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

// Body copy: Inter, clean and neutral.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

// Headings and stat numbers: Montserrat, bold and geometric — gives the app
// a distinct display voice instead of one font doing every job.
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
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
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>{children}</body>
    </html>
  );
}
