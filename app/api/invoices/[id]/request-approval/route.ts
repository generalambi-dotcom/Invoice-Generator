import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Request approval for an invoice (invoice owner only)
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

    // Only invoice owner can request approval
    if (invoice.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate approval status
    if (invoice.approvalStatus === 'pending_approval') {
      return NextResponse.json({ error: 'Invoice approval is already pending' }, { status: 400 });
    }

    if (invoice.approvalStatus === 'approved') {
      return NextResponse.json({ error: 'Invoice is already approved' }, { status: 400 });
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        approvalStatus: 'pending_approval',
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
      },
    });

    return NextResponse.json({
      invoice: updatedInvoice,
      message: 'Approval requested successfully',
    });
  } catch (error: any) {
    console.error('Error requesting approval:', error);
    return NextResponse.json(
      { error: 'Failed to request approval' },
      { status: 500 }
    );
  }
}

