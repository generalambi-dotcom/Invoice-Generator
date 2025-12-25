import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { sendInvoiceEmail } from '@/lib/email';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get payment reminders configuration
 * POST - Send payment reminders
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get invoices that need reminders
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId: user.userId,
        paymentStatus: { in: ['pending', 'overdue'] },
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
      take: 50, // Limit to prevent too many emails
    });

    return NextResponse.json({
      reminders: overdueInvoices.map(inv => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientEmail: (inv.clientInfo as any)?.email,
        clientName: (inv.clientInfo as any)?.name,
        dueDate: inv.dueDate,
        amount: inv.total - (inv.paidAmount || 0),
        currency: inv.currency,
        daysOverdue: Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
      })),
    });
  } catch (error: any) {
    console.error('Error loading payment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to load payment reminders' },
      { status: 500 }
    );
  }
}

/**
 * POST - Send payment reminders
 * Body: { invoiceIds: string[], message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.email);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { invoiceIds, message } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: 'Invoice IDs are required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const invoiceId of invoiceIds) {
      try {
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: invoiceId,
            userId: user.userId,
          },
        });

        if (!invoice) {
          results.push({ invoiceId, success: false, error: 'Invoice not found' });
          continue;
        }

        const clientEmail = (invoice.clientInfo as any)?.email;
        if (!clientEmail) {
          results.push({ invoiceId, success: false, error: 'Client email not found' });
          continue;
        }

        const outstanding = invoice.total - (invoice.paidAmount || 0);
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        const reminderMessage = message || 
          `This is a friendly reminder that invoice ${invoice.invoiceNumber} is ${daysOverdue > 0 ? `${daysOverdue} days overdue` : 'due'}. ` +
          `Outstanding amount: ${invoice.currency} ${outstanding.toFixed(2)}. ` +
          `Please make payment at your earliest convenience.`;

        // Send reminder email
        const emailResult = await sendInvoiceEmail({
          invoice,
          to: clientEmail,
          message: reminderMessage,
        });

        if (emailResult.success) {
          // Update invoice sentAt
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { sentAt: new Date() },
          });

          results.push({ invoiceId, success: true, emailId: emailResult.emailId });
        } else {
          results.push({ invoiceId, success: false, error: emailResult.error });
        }
      } catch (error: any) {
        results.push({ invoiceId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error('Error sending payment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send payment reminders' },
      { status: 500 }
    );
  }
}

