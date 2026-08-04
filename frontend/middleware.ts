import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'ss_session';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function middleware(request: NextRequest) {
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
};
