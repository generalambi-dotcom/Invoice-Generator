import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get next invoice number
 * POST - Update invoice number sequence settings
 */
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

    // Get or create sequence
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Determine reset period from format
    let resetPeriod: 'year' | 'month' | null = null;
    if (format.includes('YYYY-MM')) {
      resetPeriod = 'month';
    } else if (format.includes('YYYY')) {
      resetPeriod = 'year';
    }

    // Find existing sequence
    let sequence = await prisma.invoiceNumberSequence.findFirst({
      where: {
        userId: user.userId,
        prefix,
        ...(resetPeriod === 'year' ? { year } : {}),
        ...(resetPeriod === 'month' ? { year, month } : {}),
      },
    });

    // Create if doesn't exist
    if (!sequence) {
      sequence = await prisma.invoiceNumberSequence.create({
        data: {
          userId: user.userId,
          prefix,
          format,
          currentNumber: 1,
          year: resetPeriod ? year : null,
          month: resetPeriod === 'month' ? month : null,
          resetPeriod,
        },
      });
    } else {
      // Check if we need to reset (new year/month)
      let needsReset = false;
      if (resetPeriod === 'year' && sequence.year !== year) {
        needsReset = true;
      } else if (resetPeriod === 'month' && (sequence.year !== year || sequence.month !== month)) {
        needsReset = true;
      }

      if (needsReset) {
        sequence = await prisma.invoiceNumberSequence.update({
          where: { id: sequence.id },
          data: {
            currentNumber: 1,
            year: resetPeriod ? year : null,
            month: resetPeriod === 'month' ? month : null,
          },
        });
      }
    }

    // Generate invoice number
    let invoiceNumber = format;
    invoiceNumber = invoiceNumber.replace('PREFIX', prefix);
    invoiceNumber = invoiceNumber.replace('YYYY', year.toString());
    invoiceNumber = invoiceNumber.replace('MM', month.toString().padStart(2, '0'));
    invoiceNumber = invoiceNumber.replace('NNNN', sequence.currentNumber.toString().padStart(4, '0'));
    invoiceNumber = invoiceNumber.replace('NNN', sequence.currentNumber.toString().padStart(3, '0'));
    invoiceNumber = invoiceNumber.replace('NN', sequence.currentNumber.toString().padStart(2, '0'));

    // Increment sequence
    await prisma.invoiceNumberSequence.update({
      where: { id: sequence.id },
      data: {
        currentNumber: sequence.currentNumber + 1,
      },
    });

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

