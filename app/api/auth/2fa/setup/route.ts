import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { generateTOTPSecret, buildOtpauthUri, buildQRCodeUrl } from '@/lib/totp';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/2fa/setup
 *
 * Generates a new TOTP secret for the authenticated user (but does NOT enable 2FA yet).
 * The user must verify a code first via /api/auth/2fa/enable.
 *
 * Returns: { secret, otpauthUri, qrCodeUrl }
 */
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { email: true, twoFactorEnabled: true },
        });

        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (dbUser.twoFactorEnabled) {
            return NextResponse.json({ error: '2FA is already enabled. Disable it first.' }, { status: 400 });
        }

        const secret = generateTOTPSecret();
        const otpauthUri = buildOtpauthUri(secret, dbUser.email);
        const qrCodeUrl = buildQRCodeUrl(otpauthUri);

        // Store the secret temporarily (not yet enabled)
        await prisma.user.update({
            where: { id: user.userId },
            data: { twoFactorSecret: secret, twoFactorEnabled: false },
        });

        return NextResponse.json({ secret, otpauthUri, qrCodeUrl });
    } catch (error: any) {
        console.error('2FA setup error:', error);
        return NextResponse.json({ error: 'Failed to set up 2FA' }, { status: 500 });
    }
}
