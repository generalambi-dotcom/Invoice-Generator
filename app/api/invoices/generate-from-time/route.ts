import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// POST: Generate Invoice from selected Time Logs
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { timeLogIds, clientId } = await request.json();

        if (!timeLogIds || !Array.isArray(timeLogIds) || timeLogIds.length === 0) {
            return NextResponse.json({ error: 'No time logs selected' }, { status: 400 });
        }

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
        }

        // 1. Fetch Time Logs to calculate totals
        const logs = await prisma.timeLog.findMany({
            where: {
                id: { in: timeLogIds },
                userId: user.userId,
                status: 'pending', // Only invoice pending logs
                clientId: clientId // Ensure they belong to the selected client
            }
        });

        if (logs.length === 0) {
            return NextResponse.json({ error: 'No valid pending time logs found for this client' }, { status: 400 });
        }

        // 2. Fetch Client Info
        const client = await prisma.client.findUnique({
            where: { id: clientId, userId: user.userId }
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // 3. Fetch Company Defaults
        const defaults = await prisma.companyDefaults.findUnique({
            where: { userId: user.userId }
        });

        // 4. Generate Invoice Data
        const lineItems = logs.map(log => {
            const hours = log.duration / 60;
            const amount = hours * log.rate;
            return {
                description: `${log.description} (${new Date(log.startTime).toLocaleDateString()})`,
                quantity: hours,
                rate: log.rate,
                amount: parseFloat(amount.toFixed(2))
            };
        });

        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const total = subtotal; // Add tax calc if needed later

        // Generate Invoice Number (Simplified logic, ideally use a helper)
        const invCount = await prisma.invoice.count({ where: { userId: user.userId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

        // 5. Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                userId: user.userId,
                invoiceNumber,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
                clientId: client.id,
                companyInfo: defaults?.companyInfo || {},
                clientInfo: {
                    name: client.name,
                    email: client.email,
                    address: client.address
                },
                lineItems,
                subtotal,
                total,
                currency: logs[0].currency || 'USD',
                paymentStatus: 'pending',
                approvalStatus: 'draft'
            }
        });

        // 6. Update Time Logs status
        await prisma.timeLog.updateMany({
            where: { id: { in: logs.map(l => l.id) } },
            data: {
                status: 'billed',
                invoiceId: invoice.id
            }
        });

        return NextResponse.json({ success: true, invoiceId: invoice.id });
    } catch (error) {
        console.error('Error generating invoice from time logs:', error);
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
    }
}
