
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { validatePassword } from '@/lib/password-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken } from '@/lib/auth-jwt';
import { createRefreshToken } from '@/lib/refresh-token';
import { setAuthCookie } from '@/lib/auth-cookie';
import { buildClientUser } from '@/lib/user-payload';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { sendSequenceEmail } from '@/lib/email';
import { syncContactToBrevo } from '@/lib/brevo';
import { recordMarketingConsent } from '@/lib/email-preferences';

// Per-IP throttle to slow down bulk account creation / enumeration.
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 sign-ups per IP per hour
  message: 'Too many sign-up attempts, please try again later.',
});

// POST - Register new user
export async function POST(request: NextRequest) {
  try {
    const limit = registerRateLimiter(getClientIdentifier(request));
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.message },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { email, password, name, marketingConsent = false } = body;

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

    await recordMarketingConsent(user.id, marketingConsent === true);
    // Brevo is the marketing audience. Only add people who explicitly opted in.
    if (marketingConsent === true) {
      syncContactToBrevo(user.email, user.name, 'free').catch(console.error);
    }

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
          if (result.success && !result.skipped) {
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
      responseData.user = buildClientUser(user);
    }

    // Return success message and data. If we auto-logged the user in (email
    // verification disabled), also set the httpOnly auth cookie.
    const response = NextResponse.json(responseData, { status: 201 });
    if (responseData.token) {
      setAuthCookie(response, responseData.token);
    }
    return response;

  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
