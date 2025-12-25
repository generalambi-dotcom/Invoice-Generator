import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { autoGeneratePaymentLink } from '@/lib/auto-payment-link';

// GET - Get single invoice (public, for payment page)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const user = getAuthenticatedUser(request); // Optional, for authenticated access

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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

    // If user provided, verify ownership (for authenticated access)
    if (user && invoice.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate invoiceId
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: user.userId },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({ message: 'Invoice deleted' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice
export async function PATCH(
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

    // Verify invoice belongs to user
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (existingInvoice.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Determine the total amount (use updated value if provided, otherwise existing)
    const totalAmount = body.total !== undefined ? body.total : existingInvoice.total;

    // Auto-generate payment link if:
    // 1. No payment link is being explicitly set
    // 2. Invoice has a positive total
    // 3. Payment link doesn't already exist (or is being cleared)
    const shouldAutoGenerate = 
      body.paymentLink === undefined && 
      !existingInvoice.paymentLink && 
      totalAmount > 0;

    // Update invoice with provided fields
    let updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
        ...(body.invoiceDate && { invoiceDate: new Date(body.invoiceDate) }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
        ...(body.purchaseOrder !== undefined && { purchaseOrder: body.purchaseOrder }),
        ...(body.companyInfo && { companyInfo: body.companyInfo }),
        ...(body.clientInfo && { clientInfo: body.clientInfo }),
        ...(body.shipToInfo !== undefined && { shipToInfo: body.shipToInfo }),
        ...(body.lineItems && { lineItems: body.lineItems }),
        ...(body.subtotal !== undefined && { subtotal: body.subtotal }),
        ...(body.taxRate !== undefined && { taxRate: body.taxRate }),
        ...(body.taxAmount !== undefined && { taxAmount: body.taxAmount }),
        ...(body.discountRate !== undefined && { discountRate: body.discountRate }),
        ...(body.discountAmount !== undefined && { discountAmount: body.discountAmount }),
        ...(body.shipping !== undefined && { shipping: body.shipping }),
        ...(body.total !== undefined && { total: body.total }),
        ...(body.currency && { currency: body.currency }),
        ...(body.theme && { theme: body.theme }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.bankDetails !== undefined && { bankDetails: body.bankDetails }),
        ...(body.terms !== undefined && { terms: body.terms }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.paymentLink !== undefined && { paymentLink: body.paymentLink }),
        ...(body.paymentProvider !== undefined && { paymentProvider: body.paymentProvider }),
        ...(body.paidAmount !== undefined && { paidAmount: body.paidAmount }),
        ...(body.paymentDate && { paymentDate: new Date(body.paymentDate) }),
        // Auto-update payment status based on paid amount
        ...(body.paidAmount !== undefined && {
          paymentStatus: body.paidAmount >= totalAmount
            ? 'paid'
            : body.paidAmount > 0
            ? 'pending' // Partial payment - keep as pending
            : existingInvoice.paymentStatus,
        }),
      },
    });

    // Auto-generate payment link if conditions are met
    if (shouldAutoGenerate) {
      try {
        const paymentLinkResult = await autoGeneratePaymentLink(invoiceId, user.userId, totalAmount);
        if (paymentLinkResult) {
          updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              paymentLink: paymentLinkResult.paymentLink,
              paymentProvider: paymentLinkResult.provider,
            },
          });
        }
      } catch (error) {
        // Don't fail invoice update if payment link generation fails
        console.error('Error auto-generating payment link:', error);
      }
    }

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

