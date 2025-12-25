import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Resend verification email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        name: true,
        emailVerified: true,
      },
    });

    // Always return success (security: don't reveal if email exists)
    if (user) {
      // If already verified, don't send another email
      if (user.emailVerified) {
        return NextResponse.json({
          message: 'Email is already verified. You can sign in.',
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpiry = new Date();
      verificationExpiry.setHours(verificationExpiry.getHours() + 24); // Token expires in 24 hours

      // Save verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpiry: verificationExpiry,
        },
      });

      // Generate verification URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invoicegenerator.ng';
      const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

      // Send verification email
      try {
        const emailResult = await sendVerificationEmail({
          to: user.email,
          name: user.name,
          verificationUrl,
        });

        if (!emailResult.success) {
          console.error('❌ Failed to send verification email:', {
            email: user.email,
            error: emailResult.error,
          });
        } else {
          console.log('✅ Verification email sent successfully:', {
            email: user.email,
            emailId: emailResult.emailId,
          });
        }
      } catch (emailError: any) {
        console.error('❌ Exception sending verification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      message: 'If an account with that email exists and is not verified, we have sent a verification email.',
    });
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}

