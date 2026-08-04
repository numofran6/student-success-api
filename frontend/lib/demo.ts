/**
 * Demo mode lets you run this frontend with realistic sample data and no
 * sign-in, no backend, and no shared password to configure — useful for
 * checking the UI and interactions before the real backend/auth is wired up.
 *
 * Turn it on by setting NEXT_PUBLIC_DEMO_MODE=true in .env.local.
 * Turn it off (or delete the line) to use the real backend again.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
