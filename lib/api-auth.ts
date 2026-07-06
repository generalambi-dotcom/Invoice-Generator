/**
 * API Authentication Middleware
 * Extracts and validates JWT token from request headers
 */

import { NextRequest } from 'next/server';
import { getUserFromToken } from './auth-jwt';

export interface AuthenticatedRequest {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

/**
 * Get authenticated user from request
 * Checks Authorization header, x-auth-token header, and cookies for JWT token
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedRequest | null {
  // Collect candidate tokens in priority order: Authorization/x-auth-token
  // header first, then the httpOnly `auth_token` cookie.
  const candidates: string[] = [];

  const headerRaw = request.headers.get('authorization') || request.headers.get('x-auth-token');
  if (headerRaw) {
    let t = headerRaw.startsWith('Bearer ') ? headerRaw.substring(7) : headerRaw;
    t = t.trim();
    // Ignore junk header values. Clients that build `Bearer ${token}` from an
    // empty/absent localStorage value send "Bearer ", "Bearer null" or
    // "Bearer undefined"; these must NOT shadow the valid cookie.
    if (t && t !== 'null' && t !== 'undefined') {
      candidates.push(t);
    }
  }

  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    candidates.push(cookieToken);
  }

  // Return the first candidate that verifies.
  for (const token of candidates) {
    const user = getUserFromToken(token);
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false,
      };
    }
  }

  return null;
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(request: NextRequest): AuthenticatedRequest {
  const user = getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

