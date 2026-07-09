import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTOTP } from '@/lib/totp';
import { verifyToken, generateToken } from '@/lib/auth-jwt';
import { createRefreshToken } from '@/lib/refresh-token';
import { setAuthCookie } from '@/lib/auth-cookie';
import { buildClientUser } from '@/lib/user-payload';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/2fa/verify
 *
 * Second step of the 2FA login flow.
 * Called after the user successfully entered email+password and the login route
 * returned { requires2FA: true, tempToken }.
 *
 * Body: { tempToken: string, code: string }
 * Returns: { token, refreshToken, user } — identical shape to normal login success
 */
export async function POST(request: NextRequest) {
    try {
        const { tempToken, code } = await request.json();

        if (!tempToken || !code) {
            return NextResponse.json({ error: 'tempToken and code are required' }, { status: 400 });
        }

        // Decode and validate the temp token
        const payload = verifyToken(tempToken);
        if (!payload || !(payload as any).pending2FA) {
            return NextResponse.json({ error: 'Invalid or expired session. Please sign in again.' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true, email: true, name: true, isAdmin: true,
                twoFactorEnabled: true, twoFactorSecret: true,
                createdAt: true,
                subscriptionPlan: true, subscriptionStatus: true,
                subscriptionStartDate: true, subscriptionEndDate: true,
                subscriptionPaymentMethod: true,
            },
        });

        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (!dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
            return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 });
        }

        if (!verifyTOTP(String(code).trim(), dbUser.twoFactorSecret)) {
            return NextResponse.json({ error: 'Invalid authentication code. Please try again.' }, { status: 400 });
        }

        // 2FA verified — issue the real JWT
        const accessToken = generateToken({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            createdAt: dbUser.createdAt.toISOString(),
            isAdmin: dbUser.isAdmin,
        });
        const refreshToken = await createRefreshToken(dbUser.id);

        const response = NextResponse.json({
            token: accessToken,
            refreshToken,
            user: buildClientUser(dbUser),
        });
        return setAuthCookie(response, accessToken);
    } catch (error: any) {
        console.error('2FA verify error:', error);
        return NextResponse.json({ error: 'Failed to verify 2FA code' }, { status: 500 });
    }
}
