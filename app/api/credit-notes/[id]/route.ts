import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get a single credit note
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

    const creditNoteId = params.id;

    const creditNote = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            currency: true,
          },
        },
      },
    });

    if (!creditNote) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }

    if (creditNote.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ creditNote });
  } catch (error: any) {
    console.error('Error fetching credit note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit note' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a credit note
 */
export async function PUT(
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

    // Get existing credit note
    const existing = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only update draft credit notes
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only update draft credit notes' },
        { status: 400 }
      );
    }

    const {
      creditNoteNumber,
      creditNoteDate,
      reason,
      companyInfo,
      clientInfo,
      lineItems,
      subtotal,
      taxAmount,
      total,
      currency,
      notes,
      status,
    } = body;

    // Build update data
    const updateData: any = {};
    if (creditNoteNumber !== undefined) updateData.creditNoteNumber = creditNoteNumber;
    if (creditNoteDate !== undefined) updateData.creditNoteDate = new Date(creditNoteDate);
    if (reason !== undefined) updateData.reason = reason;
    if (companyInfo !== undefined) updateData.companyInfo = companyInfo;
    if (clientInfo !== undefined) updateData.clientInfo = clientInfo;
    if (lineItems !== undefined) updateData.lineItems = lineItems;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (taxAmount !== undefined) updateData.taxAmount = taxAmount;
    if (total !== undefined) updateData.total = total;
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    // Update credit note
    const creditNote = await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: updateData,
    });

    return NextResponse.json({ creditNote });
  } catch (error: any) {
    console.error('Error updating credit note:', error);
    return NextResponse.json(
      { error: 'Failed to update credit note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a credit note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creditNoteId = params.id;

    // Get existing credit note
    const existing = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only delete draft credit notes
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft credit notes' },
        { status: 400 }
      );
    }

    await prisma.creditNote.delete({
      where: { id: creditNoteId },
    });

    return NextResponse.json({ message: 'Credit note deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting credit note:', error);
    return NextResponse.json(
      { error: 'Failed to delete credit note' },
      { status: 500 }
    );
  }
}

