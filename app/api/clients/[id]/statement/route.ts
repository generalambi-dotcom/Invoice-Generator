import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { sendClientStatementEmail } from '@/lib/email';

// GET - Generate client statement data
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        // Verify client belongs to user
        const client = await prisma.client.findFirst({
            where: { id: params.id, userId: user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                country: true,
            },
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Build date filter for invoices
        const dateFilter: any = {};
        if (from) dateFilter.gte = new Date(from);
        if (to) dateFilter.lte = new Date(to);

        // Get all invoices for this client
        // Match invoices by clientInfo JSON containing client name/email
        const invoices = await prisma.invoice.findMany({
            where: {
                userId: user.userId,
                OR: [
                    { clientInfo: { path: ['name'], equals: client.name } },
                    ...(client.email ? [{ clientInfo: { path: ['email'], equals: client.email } }] : []),
                ],
                ...(from || to ? { invoiceDate: dateFilter } : {}),
            },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { invoiceDate: 'desc' },
        });

        // Get company info from the user
        const companyDefaults = await prisma.companyDefaults.findFirst({
            where: { userId: user.userId },
        });

        // Calculate statement summary
        const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => {
            const paidAmount = inv.payments?.reduce((ps: number, p: any) => ps + (p.amount || 0), 0) || 0;
            return sum + paidAmount;
        }, 0);
        const outstandingBalance = totalInvoiced - totalPaid;
        const overdueCount = invoices.filter(
            (inv) => inv.paymentStatus !== 'paid' && inv.dueDate && new Date(inv.dueDate) < new Date()
        ).length;

        // Format invoices for statement
        const statementItems = invoices.map((inv) => {
            const paidAmount = inv.payments?.reduce((ps: number, p: any) => ps + (p.amount || 0), 0) || 0;
            return {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                invoiceDate: inv.invoiceDate,
                dueDate: inv.dueDate,
                total: inv.total,
                paidAmount,
                balance: (inv.total || 0) - paidAmount,
                currency: inv.currency,
                paymentStatus: inv.paymentStatus,
                payments: inv.payments?.map((p: any) => ({
                    id: p.id,
                    amount: p.amount,
                    date: p.paidAt || p.createdAt,
                    method: p.method || 'payment',
                })),
            };
        });

        return NextResponse.json({
            statement: {
                client,
                companyInfo: companyDefaults?.companyInfo || null,
                generatedAt: new Date().toISOString(),
                dateRange: { from: from || null, to: to || null },
                summary: {
                    totalInvoiced,
                    totalPaid,
                    outstandingBalance,
                    invoiceCount: invoices.length,
                    overdueCount,
                },
                items: statementItems,
            },
        });
    } catch (error: any) {
        console.error('Error generating statement:', error);
        return NextResponse.json({ error: 'Failed to generate statement' }, { status: 500 });
    }
}

// POST - Send statement via email
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First get the statement data by calling the same logic
        const client = await prisma.client.findFirst({
            where: { id: params.id, userId: user.userId },
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        if (!client.email) {
            return NextResponse.json({ error: 'Client has no email address' }, { status: 400 });
        }

        // Get invoices
        const invoices = await prisma.invoice.findMany({
            where: {
                userId: user.userId,
                OR: [
                    { clientInfo: { path: ['name'], equals: client.name } },
                    ...(client.email ? [{ clientInfo: { path: ['email'], equals: client.email } }] : []),
                ],
            },
            include: { payments: true },
            orderBy: { invoiceDate: 'desc' },
        });

        const companyDefaults = await prisma.companyDefaults.findFirst({
            where: { userId: user.userId },
        });

        const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => {
            return sum + (inv.payments?.reduce((ps: number, p: any) => ps + (p.amount || 0), 0) || 0);
        }, 0);

        const companyName = (companyDefaults?.companyInfo as any)?.name || 'Your Provider';

        const result = await sendClientStatementEmail({
            to: client.email,
            clientName: client.name,
            companyName,
            invoices: invoices.map((inv) => ({
                invoiceNumber: inv.invoiceNumber,
                date: inv.invoiceDate,
                dueDate: inv.dueDate,
                total: inv.total || 0,
                paidAmount: inv.payments?.reduce((ps: number, p: any) => ps + (p.amount || 0), 0) || 0,
                currency: inv.currency,
                status: inv.paymentStatus || 'pending',
            })),
            totalInvoiced,
            totalPaid,
            outstandingBalance: totalInvoiced - totalPaid,
            currency: invoices[0]?.currency || 'USD',
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Statement sent successfully' });
        } else {
            return NextResponse.json({ error: result.error || 'Failed to send statement' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error sending statement:', error);
        return NextResponse.json({ error: 'Failed to send statement' }, { status: 500 });
    }
}
