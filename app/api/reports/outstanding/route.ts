import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get outstanding invoices report
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    // Get outstanding invoices (pending, overdue, or partially paid)
    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        userId: user.userId,
        paymentStatus: { in: ['pending', 'overdue'] },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Calculate totals
    const totalOutstanding = outstandingInvoices.reduce(
      (sum, inv) => sum + (inv.total - (inv.paidAmount || 0)),
      0
    );

    const overdueTotal = outstandingInvoices
      .filter(inv => inv.paymentStatus === 'overdue')
      .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

    const pendingTotal = outstandingInvoices
      .filter(inv => inv.paymentStatus === 'pending')
      .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

    // Group by client
    const byClient: Record<string, {
      clientName: string;
      invoiceCount: number;
      totalAmount: number;
      invoices: any[];
    }> = {};

    outstandingInvoices.forEach((invoice) => {
      const clientName = (invoice.clientInfo as any)?.name || 'Unknown Client';
      if (!byClient[clientName]) {
        byClient[clientName] = {
          clientName,
          invoiceCount: 0,
          totalAmount: 0,
          invoices: [],
        };
      }
      byClient[clientName].invoiceCount += 1;
      byClient[clientName].totalAmount += invoice.total - (invoice.paidAmount || 0);
      byClient[clientName].invoices.push(invoice);
    });

    return NextResponse.json({
      summary: {
        totalOutstanding,
        overdueTotal,
        pendingTotal,
        invoiceCount: outstandingInvoices.length,
        overdueCount: outstandingInvoices.filter(inv => inv.paymentStatus === 'overdue').length,
      },
      byClient: Object.values(byClient).sort((a, b) => b.totalAmount - a.totalAmount),
      invoices: outstandingInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: (inv.clientInfo as any)?.name,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        total: inv.total,
        paidAmount: inv.paidAmount || 0,
        outstanding: inv.total - (inv.paidAmount || 0),
        paymentStatus: inv.paymentStatus,
        currency: inv.currency,
      })),
    });
  } catch (error: any) {
    console.error('Error generating outstanding report:', error);
    return NextResponse.json(
      { error: 'Failed to generate outstanding report' },
      { status: 500 }
    );
  }
}

