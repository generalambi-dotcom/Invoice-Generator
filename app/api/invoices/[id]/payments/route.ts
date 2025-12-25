import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get payment history for an invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        paidAmount: invoice.paidAmount || 0,
        outstanding: invoice.total - (invoice.paidAmount || 0),
        currency: invoice.currency,
      },
      payments: invoice.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        status: payment.status,
        transactionId: payment.transactionId,
        reference: payment.reference,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error loading payment history:', error);
    return NextResponse.json(
      { error: 'Failed to load payment history' },
      { status: 500 }
    );
  }
}

/**
 * POST - Record a manual payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    // Verify invoice ownership
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        userId: user.userId,
        amount: parseFloat(amount),
        currency: currency || invoice.currency,
        provider: 'manual',
        status: 'completed',
        paidAt: new Date(),
        providerData: notes ? { notes } as any : null,
      },
    });

    // Update invoice paid amount
    const currentPaid = invoice.paidAmount || 0;
    const newPaidAmount = currentPaid + parseFloat(amount);
    const isFullyPaid = newPaidAmount >= invoice.total;

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        paymentDate: isFullyPaid ? new Date() : invoice.paymentDate,
        paymentStatus: isFullyPaid ? 'paid' : invoice.paymentStatus,
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

