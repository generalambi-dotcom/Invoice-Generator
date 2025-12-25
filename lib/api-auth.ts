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
  // Try Authorization header first
  let authHeader = request.headers.get('authorization');
  let token = authHeader || request.headers.get('x-auth-token');
  
  // If no token in headers, try cookies (for server-side requests)
  if (!token) {
    const cookies = request.cookies;
    token = cookies.get('auth_token')?.value || null;
  }
  
  if (!token) {
    return null;
  }

  // Extract token from "Bearer <token>" format if present
  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  const user = getUserFromToken(token);
  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin || false,
  };
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

