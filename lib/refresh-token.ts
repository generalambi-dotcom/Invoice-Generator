/**
 * Refresh token management utilities
 */

import { prisma } from './db';
import { generateRefreshToken, verifyToken } from './auth-jwt';
import crypto from 'crypto';

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

/**
 * Create a refresh token in the database
 */
export async function createRefreshToken(userId: string): Promise<string> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Generate JWT for the refresh token (for validation)
  const jwtToken = generateRefreshToken(userId);
  
  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  // Store in database
  await prisma.refreshToken.create({
    data: {
      userId,
      token: jwtToken, // Store JWT token in database
      expiresAt,
    },
  });

  return jwtToken;
}

/**
 * Verify and get refresh token
 */
export async function getRefreshToken(token: string): Promise<{
  userId: string;
  refreshToken: any;
} | null> {
  // Verify JWT token
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return null;
  }

  // Find token in database
  const refreshToken = await prisma.refreshToken.findFirst({
    where: {
      token,
      userId: decoded.userId,
      expiresAt: { gt: new Date() },
      revokedAt: null,
    },
  });

  if (!refreshToken) {
    return null;
  }

  return {
    userId: decoded.userId,
    refreshToken,
  };
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      token,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Clean up expired refresh tokens (call periodically)
 */
export async function cleanupExpiredRefreshTokens(): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}

