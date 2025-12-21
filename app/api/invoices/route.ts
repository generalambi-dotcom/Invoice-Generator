import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';
import { logRequest, logError } from '@/lib/request-logger';

// GET - Get user's invoices
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const user = getAuthenticatedUser(request);
    
    // Rate limiting
    const identifier = user ? `user:${user.userId}` : getClientIdentifier(request);
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      logRequest(request, { userId: user?.userId, statusCode: 429, responseTime: Date.now() - startTime });
      return NextResponse.json(
        { error: limitResult.message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.general.max.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
          },
        }
      );
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: user.userId };
    if (status) {
      where.paymentStatus = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (subtotal < 0 || taxAmount < 0 || discountAmount < 0 || shipping < 0) {
      return NextResponse.json(
        { error: 'Amounts cannot be negative' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.userId,
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
      },
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

