import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth-jwt';
import { createRefreshToken } from '@/lib/refresh-token';
import { getSystemSetting } from '@/lib/settings';
import { sendSequenceEmail } from '@/lib/email';
import { syncContactToBrevo } from '@/lib/brevo';
import bcrypt from 'bcryptjs';

// POST - Verify Google token and login/register user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Verify Google ID Token
        // Ideally use google-auth-library, but for simplicity we can use the tokeninfo endpoint
        // This endpoint is rate limited but fine for low traffic. For high traffic, use the library.
        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

        if (!googleResponse.ok) {
            return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
        }

        const payload = await googleResponse.json();
        const { sub: googleId, email, name, picture, email_verified } = payload;

        if (!email_verified) {
            return NextResponse.json({ error: 'Google email not verified' }, { status: 400 });
        }

        // Check configuration
        const clientId = await getSystemSetting('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
        if (clientId && payload.aud !== clientId) {
            return NextResponse.json({ error: 'Invalid client ID' }, { status: 401 });
        }

        // Find or create user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleId },
                    { email: email.toLowerCase() }
                ]
            }
        });

        if (user) {
            // Update existing user with Google info if not present
            if (!user.googleId) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleId,
                        image: picture || user.image,
                        emailVerified: true // Trust Google verification
                    }
                });
            }
        } else {
            // Create new user
            // Generate a random password since they use Google auth
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    name: name || email.split('@')[0],
                    password: hashedPassword,
                    googleId: googleId,
                    image: picture,
                    emailVerified: true
                }
            });

            // Sync new Google user to Brevo active customer list (fire-and-forget)
            syncContactToBrevo(user.email, user.name, 'free').catch(console.error);

            const newUser = user;
            // Trigger Welcome Sequence Step 1 for new google users
            sendSequenceEmail({ to: newUser.email, name: newUser.name, step: 1 })
                .then(async (result) => {
                    if (result.success) {
                        await prisma.emailLog.create({
                            data: {
                                userId: newUser.id,
                                to: newUser.email,
                                subject: 'welcome_step_1',
                                body: 'Sequence Step 1',
                                status: 'sent',
                            }
                        });
                    }
                })
                .catch(console.error);
        }

        // Ensure user is not null for TypeScript
        if (!user) {
            return NextResponse.json({ error: 'Failed to process user' }, { status: 500 });
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
            return NextResponse.json(
                { error: `Account locked. Try again in ${minutesRemaining} minutes.` },
                { status: 423 }
            );
        }

        // Generate tokens
        const accessToken = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
            isAdmin: user.isAdmin,
        });

        const refreshToken = await createRefreshToken(user.id);

        return NextResponse.json({
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                image: user.image
            },
        });

    } catch (error: any) {
        console.error('Google auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
