import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Mark invoice as sent (only approved invoices can be sent)
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

    const invoiceId = params.id;

    // Get invoice to check ownership
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { userId: true, approvalStatus: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Only invoice owner can mark as sent
    if (invoice.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only approved invoices can be marked as sent
    if (invoice.approvalStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Invoice must be approved before it can be sent' },
        { status: 400 }
      );
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        approvalStatus: 'sent',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      invoice: updatedInvoice,
      message: 'Invoice marked as sent successfully',
    });
  } catch (error: any) {
    console.error('Error marking invoice as sent:', error);
    return NextResponse.json(
      { error: 'Failed to mark invoice as sent' },
      { status: 500 }
    );
  }
}

