import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Verify email with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: { 
        id: true, 
        email: true, 
        emailVerified: true,
        emailVerificationExpiry: true 
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email is already verified',
        verified: true,
      });
    }

    // Check if token is expired
    if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });

      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      );
    }

    // Verify email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Email verified successfully! You can now sign in.',
      verified: true,
    });
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

/**
 * GET - Verify email with token (for email link clicks)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: { 
        id: true, 
        email: true, 
        emailVerified: true,
        emailVerificationExpiry: true 
      },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/verify-email?error=invalid_token', request.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL('/verify-email?verified=true', request.url)
      );
    }

    // Check if token is expired
    if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });

      return NextResponse.redirect(
        new URL('/verify-email?error=expired_token', request.url)
      );
    }

    // Verify email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return NextResponse.redirect(
      new URL('/verify-email?verified=true', request.url)
    );
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.redirect(
      new URL('/verify-email?error=server_error', request.url)
    );
  }
}

