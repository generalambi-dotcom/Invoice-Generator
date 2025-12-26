import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Apply a credit note to an invoice
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

    const creditNoteId = params.id;
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get credit note
    const creditNote = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      select: { userId: true, invoiceId: true, total: true, status: true },
    });

    if (!creditNote) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }

    if (creditNote.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (creditNote.status === 'applied') {
      return NextResponse.json(
        { error: 'Credit note has already been applied' },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { userId: true, total: true, paidAmount: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update credit note status and link to invoice
    const updatedCreditNote = await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        status: 'applied',
        invoiceId: invoiceId,
        appliedDate: new Date(),
      },
    });

    // Update invoice paid amount (reduce by credit note amount)
    // Note: This is a simple implementation. In a more sophisticated system,
    // you might want to track credit note applications separately
    const newPaidAmount = (invoice.paidAmount || 0) + creditNote.total;
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        // Update payment status if fully paid
        paymentStatus: newPaidAmount >= invoice.total ? 'paid' : 'pending',
      },
    });

    return NextResponse.json({
      creditNote: updatedCreditNote,
      message: 'Credit note applied successfully',
    });
  } catch (error: any) {
    console.error('Error applying credit note:', error);
    return NextResponse.json(
      { error: 'Failed to apply credit note' },
      { status: 500 }
    );
  }
}

