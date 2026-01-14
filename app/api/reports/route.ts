
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { startOfMonth, subMonths, format, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '6m'; // 6m, 1y, all

        // 1. Monthly Revenue (Last 6 months)
        const today = new Date();
        const startDate = subMonths(startOfMonth(today), 5); // Start 5 months ago

        const invoices = await prisma.invoice.findMany({
            where: {
                userId: user.userId,
                createdAt: { gte: startDate },
                paymentStatus: { not: 'cancelled' } // Exclude cancelled
            },
            select: {
                total: true,
                paidAmount: true,
                createdAt: true,
                paymentStatus: true,
                clientInfo: true
            }
        });

        // Group by Month
        const monthlyDataMap = new Map<string, { month: string; revenue: number; paid: number }>();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(today, i);
            const key = format(d, 'MMM yyyy');
            monthlyDataMap.set(key, { month: key, revenue: 0, paid: 0 });
        }

        invoices.forEach(inv => {
            const key = format(new Date(inv.createdAt), 'MMM yyyy');
            if (monthlyDataMap.has(key)) {
                const entry = monthlyDataMap.get(key)!;
                entry.revenue += inv.total;
                entry.paid += (inv.paidAmount || 0);
            }
        });

        const monthlyData = Array.from(monthlyDataMap.values());

        // 2. Top Clients
        const clientMap = new Map<string, { name: string; totalBilled: number; invoiceCount: number }>();

        // Fetch ALL time for top clients, not just last 6 months
        const allInvoices = await prisma.invoice.findMany({
            where: { userId: user.userId, paymentStatus: { not: 'cancelled' } },
            select: { clientInfo: true, total: true }
        });

        allInvoices.forEach(inv => {
            const clientName = (inv.clientInfo as any)?.name || 'Unknown Client';
            if (!clientMap.has(clientName)) {
                clientMap.set(clientName, { name: clientName, totalBilled: 0, invoiceCount: 0 });
            }
            const client = clientMap.get(clientName)!;
            client.totalBilled += inv.total;
            client.invoiceCount += 1;
        });

        const topClients = Array.from(clientMap.values())
            .sort((a, b) => b.totalBilled - a.totalBilled)
            .slice(0, 5);

        // 3. Status Distribution
        const statusCounts = await prisma.invoice.groupBy({
            by: ['paymentStatus'],
            where: { userId: user.userId },
            _count: { id: true },
            _sum: { total: true }
        });

        const output = {
            monthlyData,
            topClients,
            statusDistribution: statusCounts.map(s => ({
                status: s.paymentStatus,
                count: s._count.id,
                total: s._sum.total || 0
            }))
        };

        return NextResponse.json(output);

    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}
