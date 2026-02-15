import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { getNextInvoiceNumber, incrementInvoiceNumber } from '@/lib/invoice-number';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get next invoice number
 * POST - Update invoice number sequence settings
 */
// GET - Get next invoice number
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || 'INV';
    const format = searchParams.get('format') || 'PREFIX-YYYY-NNNN';

    // Use shared utility
    const { invoiceNumber, sequence } = await getNextInvoiceNumber(user.userId, prefix, format);

    // NOTE: This API endpoint peeks at the next number but typically DOES NOT increment it 
    // until the user actually saves the invoice. However, the original code WAS incrementing it.
    // "Increment sequence" was usually done here. 
    // If the frontend calls this to PREFILL a number, and then another person opens the form, 
    // they might see the same number. 
    // The original code incremented it immediately: "await prisma.invoiceNumberSequence.update..."
    // So let's maintain that behavior or check if it was intended.
    // 
    // Looking at original code:
    // await prisma.invoiceNumberSequence.update({ ... currentNumber: sequence.currentNumber + 1 ... })
    // Yes, it was incrementing. This means every time you load the invoice form (if it calls this), 
    // you burn a number. This is often done to ensure uniqueness.

    await incrementInvoiceNumber(sequence.id);

    return NextResponse.json({
      invoiceNumber,
      sequence: {
        prefix: sequence.prefix,
        format: sequence.format,
        currentNumber: sequence.currentNumber,
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice number:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice number' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update invoice number sequence settings
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prefix, format, resetPeriod } = body;

    if (!prefix || !format) {
      return NextResponse.json(
        { error: 'Prefix and format are required' },
        { status: 400 }
      );
    }

    // Validate format
    if (!format.includes('PREFIX') || !format.includes('NNNN')) {
      return NextResponse.json(
        { error: 'Format must include PREFIX and NNNN (or NNN, NN)' },
        { status: 400 }
      );
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Find existing sequence or create new one
    let sequence = await prisma.invoiceNumberSequence.findFirst({
      where: {
        userId: user.userId,
        prefix,
        ...(resetPeriod === 'year' || resetPeriod === 'month' ? { year } : {}),
        ...(resetPeriod === 'month' ? { month } : {}),
      },
    });

    if (sequence) {
      sequence = await prisma.invoiceNumberSequence.update({
        where: { id: sequence.id },
        data: {
          format,
          resetPeriod: resetPeriod || null,
        },
      });
    } else {
      sequence = await prisma.invoiceNumberSequence.create({
        data: {
          userId: user.userId,
          prefix,
          format,
          currentNumber: 1,
          year: resetPeriod ? year : null,
          month: resetPeriod === 'month' ? month : null,
          resetPeriod: resetPeriod || null,
        },
      });
    }

    return NextResponse.json({ sequence });
  } catch (error: any) {
    console.error('Error updating invoice number sequence:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice number sequence' },
      { status: 500 }
    );
  }
}

