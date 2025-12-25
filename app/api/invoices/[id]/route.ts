import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

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

    // Update invoice with provided fields
    const updatedInvoice = await prisma.invoice.update({
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
      },
    });

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

