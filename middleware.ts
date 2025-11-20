import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES } from './lib/core/utils/cookie';

const PUBLIC_ROUTES = ['/login', '/sorting-hat', '/select-class'];
const DEFAULT_LOGGED_IN_REDIRECT = '/select-class';
const DEFAULT_LOGGED_OUT_REDIRECT = '/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware Debug] Rota acessada: ${pathname}`);

  const hasAuthToken = request.cookies.has(COOKIE_NAMES.access);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (hasAuthToken) {
    if (pathname === '/login' || pathname === '/sorting-hat') {
      return NextResponse.redirect(new URL(DEFAULT_LOGGED_IN_REDIRECT, request.url));
    }

    return NextResponse.next();
  }

  if (!hasAuthToken) {
    if (isPublicRoute) return NextResponse.next();

    return NextResponse.redirect(new URL(DEFAULT_LOGGED_OUT_REDIRECT, request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
