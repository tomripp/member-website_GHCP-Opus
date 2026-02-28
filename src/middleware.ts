import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { auth } from './auth';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ['/members'];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix (e.g., /en/members -> /members)
  const pathWithoutLocale = pathname.replace(/^\/(en|de)/, '') || '/';
  return protectedPaths.some((path) => pathWithoutLocale.startsWith(path));
}

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en|de)/);
  return match ? match[1] : routing.defaultLocale;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the path is protected
  if (isProtectedPath(pathname)) {
    const session = await auth();

    if (!session) {
      const locale = getLocaleFromPath(pathname);
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
