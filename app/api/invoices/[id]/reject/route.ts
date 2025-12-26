import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Reject an invoice (admin or invoice owner)
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
    const body = await request.json();
    const { reason } = body;

    // Get invoice to check ownership
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { userId: true, approvalStatus: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if user is admin or invoice owner
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin && invoice.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        approvalStatus: 'rejected',
        approvedBy: user.userId,
        approvedAt: new Date(),
        rejectionReason: reason || null,
      },
    });

    return NextResponse.json({
      invoice: updatedInvoice,
      message: 'Invoice rejected successfully',
    });
  } catch (error: any) {
    console.error('Error rejecting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to reject invoice' },
      { status: 500 }
    );
  }
}

