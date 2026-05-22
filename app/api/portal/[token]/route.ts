import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portal/[token]
 *
 * Public endpoint — no auth required.
 * Validates the portal token and returns:
 *   - Sender (company) info from the most recent invoice
 *   - Client name / email
 *   - All non-cancelled invoices from this sender to this client email
 *   - Summary totals
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params;

        const portalToken = await prisma.clientPortalToken.findUnique({
            where: { token },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        if (!portalToken) {
            return NextResponse.json({ error: 'Invalid or expired portal link' }, { status: 404 });
        }

        if (new Date() > portalToken.expiresAt) {
            return NextResponse.json({ error: 'This portal link has expired. Please ask for a new one.' }, { status: 410 });
        }

        // Update lastAccessedAt (fire-and-forget style — don't await)
        prisma.clientPortalToken.update({
            where: { id: portalToken.id },
            data: { lastAccessedAt: new Date() },
        }).catch(() => {});

        // Find all invoices from this user to this client email
        const invoices = await prisma.invoice.findMany({
            where: {
                userId: portalToken.userId,
                paymentStatus: { not: 'cancelled' },
                // Match by clientId relation OR by clientInfo JSON email
                OR: [
                    {
                        client: {
                            email: { equals: portalToken.clientEmail, mode: 'insensitive' },
                        },
                    },
                    // Fallback: match against clientInfo JSON (Postgres JSON operator)
                    // We'll handle this in post-filter below
                ],
            },
            include: {
                payments: {
                    where: { status: { not: 'refunded' } },
                    select: { amount: true, currency: true, paidAt: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Also find invoices matched via clientInfo JSON email (for invoices without a clientId)
        const jsonMatchedInvoices = await prisma.invoice.findMany({
            where: {
                userId: portalToken.userId,
                paymentStatus: { not: 'cancelled' },
                clientId: null, // only check those without a linked Client record
            },
            include: {
                payments: {
                    where: { status: { not: 'refunded' } },
                    select: { amount: true, currency: true, paidAt: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Filter JSON-matched ones by clientInfo.email
        const jsonFiltered = jsonMatchedInvoices.filter((inv) => {
            const info = inv.clientInfo as any;
            return info?.email?.toLowerCase() === portalToken.clientEmail.toLowerCase();
        });

        // Merge, deduplicate by id
        const allIds = new Set(invoices.map((i) => i.id));
        const merged = [
            ...invoices,
            ...jsonFiltered.filter((i) => !allIds.has(i.id)),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Get sender company name from most recent invoice
        let senderCompanyName = portalToken.user.name;
        if (merged.length > 0) {
            const companyInfo = merged[0].companyInfo as any;
            if (companyInfo?.name) senderCompanyName = companyInfo.name;
        }

        // Client display name
        let clientDisplayName = portalToken.clientName;
        if (!clientDisplayName && merged.length > 0) {
            const clientInfo = merged[0].clientInfo as any;
            clientDisplayName = clientInfo?.name || clientInfo?.companyName || null;
        }

        // Summary stats
        const totalOutstanding = merged
            .filter((inv) => inv.paymentStatus !== 'paid')
            .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

        const totalPaid = merged
            .filter((inv) => inv.paymentStatus === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0);

        // Serialize invoices — only expose fields the client needs
        const safeInvoices = merged.map((inv) => ({
            id: inv.id,
            type: inv.type,
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.invoiceDate,
            dueDate: inv.dueDate,
            total: inv.total,
            paidAmount: inv.paidAmount || 0,
            currency: inv.currency,
            paymentStatus: inv.paymentStatus,
            notes: inv.notes,
            paymentLink: inv.paymentLink,
            sentAt: inv.sentAt,
        }));

        return NextResponse.json({
            success: true,
            portal: {
                clientEmail: portalToken.clientEmail,
                clientName: clientDisplayName,
                senderCompanyName,
                senderName: portalToken.user.name,
                expiresAt: portalToken.expiresAt,
                invoiceCount: merged.length,
                totalOutstanding,
                totalPaid,
                currency: merged[0]?.currency || 'USD',
            },
            invoices: safeInvoices,
        });
    } catch (error: any) {
        console.error('Error fetching portal data:', error);
        return NextResponse.json({ error: 'Failed to load portal' }, { status: 500 });
    }
}
