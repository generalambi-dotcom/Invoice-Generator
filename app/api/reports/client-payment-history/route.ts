import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get client payment history report
 * Query params: clientId (optional - if not provided, returns all clients)
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

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // Get all invoices for user
    const where: any = {
      userId: user.userId,
      paymentStatus: { not: 'cancelled' },
    };

    if (clientId) {
      where.clientId = clientId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    // Group by client
    const clientHistory: Record<string, {
      clientId: string | null;
      clientName: string;
      totalInvoices: number;
      totalAmount: number;
      paidAmount: number;
      outstandingAmount: number;
      averageInvoiceValue: number;
      onTimePayments: number;
      latePayments: number;
      invoices: any[];
    }> = {};

    invoices.forEach((invoice) => {
      const clientName = (invoice.clientInfo as any)?.name || 'Unknown Client';
      const clientKey = invoice.clientId || clientName;

      if (!clientHistory[clientKey]) {
        clientHistory[clientKey] = {
          clientId: invoice.clientId,
          clientName,
          totalInvoices: 0,
          totalAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0,
          averageInvoiceValue: 0,
          onTimePayments: 0,
          latePayments: 0,
          invoices: [],
        };
      }

      const paid = invoice.paidAmount || (invoice.paymentStatus === 'paid' ? invoice.total : 0);
      const outstanding = invoice.total - paid;
      const isOnTime = invoice.paymentStatus === 'paid' && 
        invoice.paymentDate && 
        new Date(invoice.paymentDate) <= new Date(invoice.dueDate);

      clientHistory[clientKey].totalInvoices += 1;
      clientHistory[clientKey].totalAmount += invoice.total;
      clientHistory[clientKey].paidAmount += paid;
      clientHistory[clientKey].outstandingAmount += outstanding;
      
      if (invoice.paymentStatus === 'paid') {
        if (isOnTime) {
          clientHistory[clientKey].onTimePayments += 1;
        } else {
          clientHistory[clientKey].latePayments += 1;
        }
      }

      clientHistory[clientKey].invoices.push({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        total: invoice.total,
        paidAmount: paid,
        outstanding: outstanding,
        paymentStatus: invoice.paymentStatus,
        paymentDate: invoice.paymentDate,
        currency: invoice.currency,
        payments: invoice.payments,
      });
    });

    // Calculate averages
    Object.values(clientHistory).forEach((client) => {
      client.averageInvoiceValue = client.totalAmount / client.totalInvoices;
    });

    return NextResponse.json({
      clients: Object.values(clientHistory).sort((a, b) => b.totalAmount - a.totalAmount),
    });
  } catch (error: any) {
    console.error('Error generating client payment history:', error);
    return NextResponse.json(
      { error: 'Failed to generate client payment history' },
      { status: 500 }
    );
  }
}

