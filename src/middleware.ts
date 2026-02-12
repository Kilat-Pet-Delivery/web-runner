import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or rely on client-side redirect
  // Since we use localStorage (not cookies), middleware can't check auth
  // Client-side AuthGuard handles the actual redirect
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
