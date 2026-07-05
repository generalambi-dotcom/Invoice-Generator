/**
 * Helpers for storing the auth JWT in an httpOnly cookie.
 *
 * Keeping the access token in an httpOnly + Secure cookie (instead of
 * localStorage) means client-side JavaScript — including any injected XSS
 * payload — cannot read it. Requests to same-origin API routes send the cookie
 * automatically, and both `middleware.ts` and `lib/api-auth.ts` already read
 * `auth_token` from cookies.
 */

import { NextResponse } from 'next/server';

export const AUTH_COOKIE = 'auth_token';

// Match the access-token lifetime in lib/auth-jwt.ts (7 days).
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

/** Attach the auth token as an httpOnly cookie to a response. */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(AUTH_COOKIE, token, { ...baseOptions(), maxAge: MAX_AGE_SECONDS });
  return response;
}

/** Clear the auth cookie (used on logout). */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE, '', { ...baseOptions(), maxAge: 0 });
  return response;
}
