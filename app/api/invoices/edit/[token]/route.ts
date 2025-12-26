import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch invoice by token (for editing)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Find invoice by token
    const invoice = await prisma.invoice.findFirst({
      where: {
        editableToken: token,
        editableTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invalid or expired edit token' },
        { status: 404 }
      );
    }

    // Return invoice data (sanitized for customer editing)
    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        purchaseOrder: invoice.purchaseOrder,
        companyInfo: invoice.companyInfo,
        clientInfo: invoice.clientInfo,
        shipToInfo: invoice.shipToInfo,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        discountRate: invoice.discountRate,
        discountAmount: invoice.discountAmount,
        shipping: invoice.shipping,
        total: invoice.total,
        currency: invoice.currency,
        theme: invoice.theme,
        notes: invoice.notes,
        bankDetails: invoice.bankDetails,
        terms: invoice.terms,
      },
      owner: {
        name: invoice.user.name,
        email: invoice.user.email,
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoice by token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice via token
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const body = await request.json();

    // Find invoice by token
    const invoice = await prisma.invoice.findFirst({
      where: {
        editableToken: token,
        editableTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invalid or expired edit token' },
        { status: 404 }
      );
    }

    // Calculate totals
    const lineItems = body.lineItems || invoice.lineItems;
    const subtotal = lineItems.reduce((sum: number, item: any) => {
      return sum + (item.amount || 0);
    }, 0);

    const taxAmount = (subtotal * (body.taxRate || invoice.taxRate || 0)) / 100;
    const discountAmount = (subtotal * (body.discountRate || invoice.discountRate || 0)) / 100;
    const shipping = body.shipping || invoice.shipping || 0;
    const total = subtotal - discountAmount + taxAmount + shipping;

    // Update invoice (allow customer to edit specific fields)
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        // Customer can edit these fields
        clientInfo: body.clientInfo || invoice.clientInfo,
        shipToInfo: body.shipToInfo !== undefined ? body.shipToInfo : invoice.shipToInfo,
        lineItems: body.lineItems || invoice.lineItems,
        purchaseOrder: body.purchaseOrder !== undefined ? body.purchaseOrder : invoice.purchaseOrder,
        notes: body.notes !== undefined ? body.notes : invoice.notes,
        
        // Recalculate totals
        subtotal,
        taxRate: body.taxRate !== undefined ? body.taxRate : invoice.taxRate,
        taxAmount,
        discountRate: body.discountRate !== undefined ? body.discountRate : invoice.discountRate,
        discountAmount,
        shipping,
        total,
        
        // Mark that customer edited
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      invoice: updatedInvoice,
      message: 'Invoice updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating invoice via token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

