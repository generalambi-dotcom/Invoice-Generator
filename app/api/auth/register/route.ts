
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { validatePassword } from '@/lib/password-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken } from '@/lib/auth-jwt';
import { createRefreshToken } from '@/lib/refresh-token';
import { sendSequenceEmail } from '@/lib/email';
import { syncContactToBrevo } from '@/lib/brevo';

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

    // Check system settings for email verification requirement
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'auth_settings' }
    });

    // Default to true if not set or if setting value is invalid
    let emailVerificationRequired = true;
    if (setting) {
      try {
        const authSettings = JSON.parse(setting.value);
        if (typeof authSettings.emailVerificationRequired === 'boolean') {
          emailVerificationRequired = authSettings.emailVerificationRequired;
        }
      } catch (e) {
        console.error("Error parsing auth_settings system setting:", e);
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        isAdmin: false,
        emailVerified: !emailVerificationRequired, // Auto-verify if required is false
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Sync new user to Brevo active customer list (fire-and-forget)
    syncContactToBrevo(user.email, user.name, 'free').catch(console.error);

    // Send verification email only if required
    if (emailVerificationRequired) {
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
    }

    // Prepare response data
    let responseData: any = {
      message: emailVerificationRequired
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful! You can now log in.',
      requiresVerification: emailVerificationRequired,
    };

    // If verification is NOT required, generate tokens for auto-login
    if (!emailVerificationRequired) {
      const accessToken = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        isAdmin: user.isAdmin,
      });

      const refreshToken = await createRefreshToken(user.id);

      // Trigger Welcome Sequence Step 1
      sendSequenceEmail({ to: user.email, name: user.name, step: 1 })
        .then(async (result) => {
          if (result.success) {
            await prisma.emailLog.create({
              data: {
                userId: user.id,
                to: user.email,
                subject: 'welcome_step_1',
                body: 'Sequence Step 1',
                status: 'sent',
              }
            });
          }
        })
        .catch(console.error);

      responseData.token = accessToken;
      responseData.refreshToken = refreshToken;
      responseData.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      };
    }

    // Return success message and data
    return NextResponse.json(responseData, { status: 201 });

  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
