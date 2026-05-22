import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/portal/generate
 *
 * Creates (or refreshes) a client portal access token for a given client email.
 * The token gives the client read-only access to all invoices from this user
 * addressed to that email, without requiring a login.
 *
 * Body: { clientEmail: string, clientName?: string }
 * Returns: { token: string, portalUrl: string, expiresAt: string }
 */
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { clientEmail, clientName } = body;

        if (!clientEmail || typeof clientEmail !== 'string') {
            return NextResponse.json({ error: 'clientEmail is required' }, { status: 400 });
        }

        const normalizedEmail = clientEmail.trim().toLowerCase();

        // Generate a cryptographically secure token
        const token = randomBytes(32).toString('hex');

        // Token expires in 90 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        // Upsert: if a token already exists for this userId+clientEmail, replace it
        const existing = await prisma.clientPortalToken.findFirst({
            where: {
                userId: user.userId,
                clientEmail: normalizedEmail,
            },
        });

        let portalToken;
        if (existing) {
            portalToken = await prisma.clientPortalToken.update({
                where: { id: existing.id },
                data: {
                    token,
                    clientName: clientName || existing.clientName,
                    expiresAt,
                    lastAccessedAt: null,
                },
            });
        } else {
            portalToken = await prisma.clientPortalToken.create({
                data: {
                    token,
                    userId: user.userId,
                    clientEmail: normalizedEmail,
                    clientName: clientName || null,
                    expiresAt,
                },
            });
        }

        const origin = request.headers.get('origin') || 'https://invoicegenerator.ng';
        const portalUrl = `${origin}/portal/${token}`;

        return NextResponse.json({
            success: true,
            token: portalToken.token,
            portalUrl,
            expiresAt: portalToken.expiresAt.toISOString(),
        });
    } catch (error: any) {
        console.error('Error generating portal token:', error);
        return NextResponse.json({ error: 'Failed to generate portal link' }, { status: 500 });
    }
}
