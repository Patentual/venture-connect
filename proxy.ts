import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

const secretKey = process.env.SESSION_SECRET || 'venture-connect-dev-secret-change-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

// Routes that require full authentication (including 2FA)
const protectedPaths = ['/dashboard'];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix (e.g., /en/dashboard → /dashboard)
  const segments = pathname.split('/');
  const locales = routing.locales as readonly string[];
  const pathWithoutLocale =
    segments.length > 1 && locales.includes(segments[1])
      ? '/' + segments.slice(2).join('/')
      : pathname;

  return protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  if (isProtectedPath(pathname)) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ['HS256'],
      });

      // Require completed 2FA
      if (!payload.twoFactorVerified) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Invalid/expired token — redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run next-intl middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
