import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Update overdue invoices
 * This endpoint should be called periodically (via cron job or scheduled task)
 * to mark invoices as overdue when their due date has passed
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // Find all pending invoices with due date in the past
    const overdueInvoices = await prisma.invoice.updateMany({
      where: {
        paymentStatus: 'pending',
        dueDate: {
          lt: now,
        },
      },
      data: {
        paymentStatus: 'overdue',
      },
    });

    return NextResponse.json({
      message: 'Overdue invoices updated',
      count: overdueInvoices.count,
    });
  } catch (error: any) {
    console.error('Error updating overdue invoices:', error);
    return NextResponse.json(
      { error: 'Failed to update overdue invoices' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check and update overdue invoices (for manual trigger)
 */
export async function GET(request: NextRequest) {
  return POST(request);
}

