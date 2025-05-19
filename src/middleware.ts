import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is much simpler now that we're using localStorage for auth
export function middleware(request: NextRequest) {
  // Allow all API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow access to login page
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Note: Since localStorage is client-side only, we can't check it in middleware
  // We'll handle auth in the components themselves
  return NextResponse.next();
}

// Specify which routes this middleware should run for
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 