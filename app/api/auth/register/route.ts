import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { validatePassword } from '@/lib/password-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// POST - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // Token expires in 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        isAdmin: false,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invoicegenerator.ng';
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

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
        // Still return success - user can request resend
      } else {
        console.log('✅ Verification email sent successfully:', {
          email: user.email,
          emailId: emailResult.emailId,
        });
      }
    } catch (emailError: any) {
      console.error('❌ Exception sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Return success message (don't return token - user needs to verify email first)
    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

