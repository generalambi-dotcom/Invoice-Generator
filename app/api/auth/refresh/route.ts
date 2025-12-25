import { NextRequest, NextResponse } from 'next/server';
import { getRefreshToken } from '@/lib/refresh-token';
import { generateToken } from '@/lib/auth-jwt';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const tokenData = await getRefreshToken(refreshToken);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Email not verified',
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Generate new access token
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString(),
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

