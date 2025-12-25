/**
 * JWT-based authentication utilities
 * Replaces insecure x-user-id header with proper JWT tokens
 */

import jwt from 'jsonwebtoken';

// User interface (matches lib/auth.ts)
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

// Get JWT_SECRET with lazy validation (only when actually used)
function getJWTSecret(): string {
  const JWT_SECRET_ENV = process.env.JWT_SECRET;

  if (!JWT_SECRET_ENV) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
      'Please set it in your environment variables. ' +
      'For security, use a strong random string (minimum 32 characters).'
    );
  }

  if (JWT_SECRET_ENV.length < 32) {
    console.warn(
      '⚠️  WARNING: JWT_SECRET is less than 32 characters. ' +
      'For security, please use a longer secret (minimum 32 characters recommended).'
    );
  }

  return JWT_SECRET_ENV;
}

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRES_IN = '15m';
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get user from JWT token (for API routes)
 */
export function getUserFromToken(token: string | null): JWTPayload | null {
  if (!token) return null;
  
  // Remove 'Bearer ' prefix if present
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  return verifyToken(cleanToken);
}

/**
 * Generate refresh token (longer-lived token for getting new access tokens)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, getJWTSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

