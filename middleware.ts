import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromToken } from './lib/auth-jwt';

/**
 * Routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/history',
  '/settings',
  '/upgrade',
  '/admin',
];

/**
 * Routes that should only be accessible when NOT authenticated
 */
const publicOnlyRoutes = [
  '/signin',
  '/signup',
];

/**
 * Admin-only routes
 */
const adminRoutes = [
  '/admin',
];

/**
 * Next.js middleware to protect routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or Authorization header
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth_token')?.value;
  const token = authHeader?.replace(/^Bearer\s+/i, '') || cookieToken;

  // Verify token and get user
  let user = null;
  if (token) {
    user = getUserFromToken(token);
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Redirect to signin if accessing protected route without auth
  // But allow client-side navigation to handle auth checks for better UX
  if (isProtectedRoute && !user) {
    // Check if this is a client-side navigation (has referer from same origin)
    const referer = request.headers.get('referer');
    const isClientNavigation = referer && new URL(referer).origin === request.nextUrl.origin;
    
    // Only redirect on server-side requests, let client handle navigation
    if (!isClientNavigation) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect to dashboard if accessing public-only routes while authenticated
  if (isPublicOnlyRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check admin routes
  if (isAdminRoute && user && !user.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

