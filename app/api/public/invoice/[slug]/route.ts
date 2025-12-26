import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserByPublicSlug } from '@/lib/public-invoice';
import { autoGeneratePaymentLink } from '@/lib/auto-payment-link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get company info for public invoice creation
 * This allows customers to see the company info and create invoices
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const user = await getUserByPublicSlug(slug);

    if (!user) {
      return NextResponse.json(
        { error: 'Invoice link not found' },
        { status: 404 }
      );
    }

    // Get company defaults
    const defaults = await prisma.companyDefaults.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      companyName: user.name,
      companyInfo: defaults?.companyInfo || null,
      defaultCurrency: defaults?.defaultCurrency || 'USD',
      defaultTheme: defaults?.defaultTheme || 'slate',
      defaultTaxRate: defaults?.defaultTaxRate || 0,
      slug: user.publicSlug,
    });
  } catch (error: any) {
    console.error('Error fetching public invoice info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice information' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create invoice via public link (customer-created)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const user = await getUserByPublicSlug(slug);

    if (!user) {
      return NextResponse.json(
        { error: 'Invoice link not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      purchaseOrder,
      companyInfo,
      clientInfo,
      shipToInfo,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discountRate,
      discountAmount,
      shipping,
      total,
      currency,
      theme,
      notes,
      bankDetails,
      terms,
      customerEmail, // Email of the customer creating the invoice
    } = body;

    // Input validation
    if (!invoiceNumber || !invoiceDate || !dueDate) {
      return NextResponse.json(
        { error: 'Invoice number, date, and due date are required' },
        { status: 400 }
      );
    }

    if (!companyInfo || !clientInfo) {
      return NextResponse.json(
        { error: 'Company and client information are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    if (typeof total !== 'number' || total < 0) {
      return NextResponse.json(
        { error: 'Total must be a positive number' },
        { status: 400 }
      );
    }

    // Create invoice with source tracking
    try {
      const invoice = await prisma.invoice.create({
        data: {
          userId: user.id,
          invoiceNumber,
          invoiceDate: new Date(invoiceDate),
          dueDate: new Date(dueDate),
          purchaseOrder: purchaseOrder || null,
          companyInfo,
          clientInfo,
          shipToInfo: shipToInfo || null,
          lineItems,
          subtotal,
          taxRate: taxRate || 0,
          taxAmount: taxAmount || 0,
          discountRate: discountRate || 0,
          discountAmount: discountAmount || 0,
          shipping: shipping || 0,
          total,
          currency: currency || 'USD',
          theme: theme || 'slate',
          notes: notes || null,
          bankDetails: bankDetails || null,
          terms: terms || null,
          paymentStatus: 'pending',
          createdBy: 'customer', // Mark as customer-created
          customerEmail: customerEmail || null,
        },
      });

      console.log(`✅ Public invoice created: ${invoice.id} for user ${user.id} (${invoiceNumber})`);

      // Auto-generate payment link if credentials are configured
      if (total > 0) {
        try {
          const paymentLinkResult = await autoGeneratePaymentLink(invoice.id, user.id, total);
          if (paymentLinkResult) {
            const updatedInvoice = await prisma.invoice.update({
              where: { id: invoice.id },
              data: {
                paymentLink: paymentLinkResult.paymentLink,
                paymentProvider: paymentLinkResult.provider,
              },
            });
            console.log(`✅ Payment link generated for invoice ${invoice.id}`);
            return NextResponse.json({ invoice: updatedInvoice }, { status: 201 });
          }
        } catch (error) {
          // Don't fail invoice creation if payment link generation fails
          console.error('Error auto-generating payment link:', error);
        }
      }

      return NextResponse.json({ invoice }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error creating public invoice:', dbError);
      // Check if it's a unique constraint violation (duplicate invoice number)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Invoice number already exists. Please use a different invoice number.' },
          { status: 400 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error creating public invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update invoice via public link (customer editing)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();
    const { invoiceId, ...updateData } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Verify invoice belongs to the user with this slug
    const user = await getUserByPublicSlug(slug);
    if (!user) {
      return NextResponse.json(
        { error: 'Invoice link not found' },
        { status: 404 }
      );
    }

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id,
        createdBy: 'customer', // Only allow editing customer-created invoices
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found or cannot be edited' },
        { status: 404 }
      );
    }

    // Update invoice
    try {
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          ...(updateData.invoiceNumber && { invoiceNumber: updateData.invoiceNumber }),
          ...(updateData.invoiceDate && { invoiceDate: new Date(updateData.invoiceDate) }),
          ...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) }),
          ...(updateData.purchaseOrder !== undefined && { purchaseOrder: updateData.purchaseOrder }),
          ...(updateData.companyInfo && { companyInfo: updateData.companyInfo }),
          ...(updateData.clientInfo && { clientInfo: updateData.clientInfo }),
          ...(updateData.shipToInfo !== undefined && { shipToInfo: updateData.shipToInfo }),
          ...(updateData.lineItems && { lineItems: updateData.lineItems }),
          ...(updateData.subtotal !== undefined && { subtotal: updateData.subtotal }),
          ...(updateData.taxRate !== undefined && { taxRate: updateData.taxRate }),
          ...(updateData.taxAmount !== undefined && { taxAmount: updateData.taxAmount }),
          ...(updateData.discountRate !== undefined && { discountRate: updateData.discountRate }),
          ...(updateData.discountAmount !== undefined && { discountAmount: updateData.discountAmount }),
          ...(updateData.shipping !== undefined && { shipping: updateData.shipping }),
          ...(updateData.total !== undefined && { total: updateData.total }),
          ...(updateData.currency && { currency: updateData.currency }),
          ...(updateData.theme && { theme: updateData.theme }),
          ...(updateData.notes !== undefined && { notes: updateData.notes }),
          ...(updateData.bankDetails !== undefined && { bankDetails: updateData.bankDetails }),
          ...(updateData.terms !== undefined && { terms: updateData.terms }),
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Public invoice updated: ${invoiceId} (${updatedInvoice.invoiceNumber})`);

      // Regenerate payment link if total changed
      if (updateData.total && updateData.total > 0 && updateData.total !== existingInvoice.total) {
        try {
          const paymentLinkResult = await autoGeneratePaymentLink(
            invoiceId,
            user.id,
            updateData.total
          );
          if (paymentLinkResult) {
            const finalInvoice = await prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                paymentLink: paymentLinkResult.paymentLink,
                paymentProvider: paymentLinkResult.provider,
              },
            });
            console.log(`✅ Payment link regenerated for invoice ${invoiceId}`);
            return NextResponse.json({ invoice: finalInvoice });
          }
        } catch (error) {
          console.error('Error regenerating payment link:', error);
        }
      }

      return NextResponse.json({ invoice: updatedInvoice });
    } catch (dbError: any) {
      console.error('Database error updating public invoice:', dbError);
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error updating public invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

