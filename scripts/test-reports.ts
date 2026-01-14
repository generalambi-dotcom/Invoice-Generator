
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { subMonths, startOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Testing Reports Logic...');

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No users found.');
        return;
    }
    console.log(`User: ${user.email} (${user.id})`);

    // 2. Simulate Monthly Revenue
    const today = new Date();
    const startDate = subMonths(startOfMonth(today), 5); // Start 5 months ago

    const invoices = await prisma.invoice.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: startDate },
            paymentStatus: { not: 'cancelled' }
        },
        select: {
            total: true,
            paidAmount: true,
            createdAt: true,
        }
    });

    console.log(`Found ${invoices.length} invoices in last 6 months.`);

    const monthlyRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    console.log(`💰 Total Revenue (6m): ${monthlyRevenue}`);

    // 3. Top Clients
    const allInvoices = await prisma.invoice.findMany({
        where: { userId: user.id, paymentStatus: { not: 'cancelled' } },
        select: { clientInfo: true, total: true }
    });

    const clientMap = new Map();
    allInvoices.forEach(inv => {
        const clientName = (inv.clientInfo as any)?.name || 'Unknown';
        const current = clientMap.get(clientName) || 0;
        clientMap.set(clientName, current + inv.total);
    });

    console.log('🏆 Top Clients:');
    Array.from(clientMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by revenue desc
        .slice(0, 3)
        .forEach(([name, total]) => console.log(`   - ${name}: ${total}`));

    console.log('✅ Reports Logic Validation Complete');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
