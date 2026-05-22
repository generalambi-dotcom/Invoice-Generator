import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/invoices/[id]/events
 *
 * Returns the audit trail for a single invoice.
 * Auth required — owner only.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify ownership
        const invoice = await prisma.invoice.findFirst({
            where: { id: params.id, userId: user.userId },
            select: { id: true },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const events = await prisma.invoiceEvent.findMany({
            where: { invoiceId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({ events });
    } catch (error: any) {
        console.error('Error fetching invoice events:', error);
        return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 });
    }
}
