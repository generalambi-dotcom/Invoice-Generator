import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { verifyTOTP } from '@/lib/totp';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/2fa/disable
 *
 * Disables 2FA. Requires either:
 *   - A valid TOTP code (preferred), OR
 *   - The account password (fallback, for locked-out users)
 *
 * Body: { code?: string; password?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { code, password } = await request.json();

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true, password: true },
        });

        if (!dbUser?.twoFactorEnabled) {
            return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
        }

        let verified = false;

        if (code && dbUser.twoFactorSecret) {
            verified = verifyTOTP(String(code).trim(), dbUser.twoFactorSecret);
        } else if (password) {
            verified = await bcrypt.compare(password, dbUser.password);
        }

        if (!verified) {
            return NextResponse.json({ error: 'Invalid code or password. 2FA not disabled.' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.userId },
            data: { twoFactorEnabled: false, twoFactorSecret: null },
        });

        return NextResponse.json({ success: true, message: '2FA has been disabled.' });
    } catch (error: any) {
        console.error('2FA disable error:', error);
        return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
    }
}
