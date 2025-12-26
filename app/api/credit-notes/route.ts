import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get user's credit notes
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');

    const where: any = { userId: user.userId };
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }
    if (status) {
      where.status = status;
    }

    const creditNotes = await prisma.creditNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });

    return NextResponse.json({ creditNotes });
  } catch (error: any) {
    console.error('Error fetching credit notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit notes' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new credit note
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      invoiceId,
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
    } = body;

    // Validation
    if (!creditNoteNumber || !creditNoteDate) {
      return NextResponse.json(
        { error: 'Credit note number and date are required' },
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

    // Check if credit note number already exists for this user
    const existing = await prisma.creditNote.findUnique({
      where: {
        userId_creditNoteNumber: {
          userId: user.userId,
          creditNoteNumber,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Credit note number already exists' },
        { status: 400 }
      );
    }

    // If invoiceId is provided, verify it belongs to the user
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { userId: true },
      });

      if (!invoice || invoice.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Invoice not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    // Create credit note
    const creditNote = await prisma.creditNote.create({
      data: {
        userId: user.userId,
        invoiceId: invoiceId || null,
        creditNoteNumber,
        creditNoteDate: new Date(creditNoteDate),
        reason: reason || null,
        companyInfo,
        clientInfo,
        lineItems,
        subtotal,
        taxAmount: taxAmount || 0,
        total,
        currency: currency || 'USD',
        notes: notes || null,
        status: 'draft',
      },
    });

    return NextResponse.json({ creditNote });
  } catch (error: any) {
    console.error('Error creating credit note:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Credit note number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create credit note' },
      { status: 500 }
    );
  }
}

