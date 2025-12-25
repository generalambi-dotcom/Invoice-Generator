import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth-jwt';
import { createRefreshToken } from '@/lib/refresh-token';
import bcrypt from 'bcryptjs';

// POST - Login user and return JWT token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists - return generic error
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { 
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
          locked: true,
          lockedUntil: user.lockedUntil.toISOString(),
        },
        { status: 423 } // 423 Locked
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const MAX_FAILED_ATTEMPTS = 5;
      const LOCKOUT_DURATION_MINUTES = 15;

      let updateData: any = {
        failedLoginAttempts: failedAttempts,
      };

      // Lock account after MAX_FAILED_ATTEMPTS failed attempts
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
        updateData.lockedUntil = lockedUntil;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - failedAttempts;
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          ...(attemptsRemaining > 0 && attemptsRemaining <= 3 
            ? { attemptsRemaining: `${attemptsRemaining} attempt(s) remaining before account lockout` }
            : {}),
        },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before signing in. Check your inbox for the verification email.',
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 } // 403 Forbidden
      );
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate access token
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      isAdmin: user.isAdmin,
    });

    // Generate refresh token
    const refreshToken = await createRefreshToken(user.id);

    // Return tokens and user info (without password)
    return NextResponse.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

