import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInvoiceEmail } from '@/lib/email';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { generateInvoicePDFBuffer } from '@/lib/pdf-server';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';
import { logRequest, logError } from '@/lib/request-logger';

// POST - Send invoice via email
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let user: any = null;
  
  try {
    user = getAuthenticatedUser(request);
    
    // Rate limiting
    const identifier = user ? `user:${user.userId}` : getClientIdentifier(request);
    const limiter = rateLimit(rateLimitConfigs.email);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      logRequest(request, { userId: user?.userId, statusCode: 429, responseTime: Date.now() - startTime });
      return NextResponse.json(
        { error: limitResult.message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.email.max.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
          },
        }
      );
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceId, recipientEmail, message } = body;

    // Validation
    if (!invoiceId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Invoice ID and recipient email are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: user.userId },
      include: { user: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate PDF for attachment (server-side)
    let pdfBuffer: Buffer | undefined;
    try {
      // Convert database invoice format for PDF generation
      const pdfInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        purchaseOrder: invoice.purchaseOrder,
        company: invoice.companyInfo,
        client: invoice.clientInfo,
        shipTo: invoice.shipToInfo,
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
      };

      const generatedPdf = await generateInvoicePDFBuffer(pdfInvoice);
      pdfBuffer = generatedPdf || undefined;
    } catch (pdfError: any) {
      console.error('Error generating PDF for email:', pdfError);
      // Continue without PDF attachment if generation fails
    }

    // Send email with PDF attachment
    const emailResult = await sendInvoiceEmail({
      invoice,
      to: recipientEmail,
      message: message || '',
      pdfBuffer,
    });

    // Log email
    await prisma.emailLog.create({
      data: {
        userId: user.userId,
        invoiceId,
        to: recipientEmail,
        subject: `Invoice ${invoice.invoiceNumber} from ${invoice.user.name}`,
        body: message || '',
        status: emailResult.success ? 'sent' : 'failed',
        errorMessage: emailResult.error || null,
      },
    });

    // Update invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { sentAt: new Date() },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    const responseTime = Date.now() - startTime;
    logRequest(request, { userId: user.userId, statusCode: 200, responseTime });
    
    return NextResponse.json({ 
      message: 'Invoice sent successfully',
      emailId: emailResult.emailId,
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitConfigs.email.max.toString(),
        'X-RateLimit-Remaining': (limitResult.remaining - 1).toString(),
        'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
      },
    });
  } catch (error: any) {
    logError(request, error, user?.userId);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}

