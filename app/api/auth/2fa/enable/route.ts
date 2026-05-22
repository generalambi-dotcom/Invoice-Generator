import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { verifyTOTP } from '@/lib/totp';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/2fa/enable
 *
 * Verifies the TOTP code from the user's authenticator app and enables 2FA.
 * Requires a prior call to /api/auth/2fa/setup to have stored the secret.
 *
 * Body: { code: string }
 */
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { code } = await request.json();
        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true },
        });

        if (!dbUser?.twoFactorSecret) {
            return NextResponse.json({ error: 'No 2FA setup in progress. Call /api/auth/2fa/setup first.' }, { status: 400 });
        }

        if (dbUser.twoFactorEnabled) {
            return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
        }

        if (!verifyTOTP(code.trim(), dbUser.twoFactorSecret)) {
            return NextResponse.json({ error: 'Invalid verification code. Please try again.' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.userId },
            data: { twoFactorEnabled: true },
        });

        return NextResponse.json({ success: true, message: '2FA has been enabled successfully.' });
    } catch (error: any) {
        console.error('2FA enable error:', error);
        return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
    }
}
