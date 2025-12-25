import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { revokeRefreshToken, revokeAllUserRefreshTokens } from '@/lib/refresh-token';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Logout user and revoke refresh tokens
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { refreshToken } = body;

    // Revoke specific refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Revoke all user refresh tokens for security
    await revokeAllUserRefreshTokens(user.userId);

    return NextResponse.json({
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

