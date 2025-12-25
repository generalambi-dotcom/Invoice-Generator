import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get revenue reports
 * Query params: period (daily|weekly|monthly|yearly), startDate, endDate
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
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get all invoices for user
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.userId,
        paymentStatus: { not: 'cancelled' },
        ...(Object.keys(dateFilter).length > 0 && { invoiceDate: dateFilter }),
      },
      orderBy: { invoiceDate: 'asc' },
    });

    // Calculate revenue by period
    const revenueByPeriod: Record<string, {
      period: string;
      totalRevenue: number;
      paidRevenue: number;
      unpaidRevenue: number;
      invoiceCount: number;
      paidCount: number;
    }> = {};

    invoices.forEach((invoice) => {
      let periodKey = '';
      const date = new Date(invoice.invoiceDate);

      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          periodKey = String(date.getFullYear());
          break;
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!revenueByPeriod[periodKey]) {
        revenueByPeriod[periodKey] = {
          period: periodKey,
          totalRevenue: 0,
          paidRevenue: 0,
          unpaidRevenue: 0,
          invoiceCount: 0,
          paidCount: 0,
        };
      }

      revenueByPeriod[periodKey].totalRevenue += invoice.total;
      revenueByPeriod[periodKey].invoiceCount += 1;

      if (invoice.paymentStatus === 'paid') {
        revenueByPeriod[periodKey].paidRevenue += invoice.paidAmount || invoice.total;
        revenueByPeriod[periodKey].paidCount += 1;
      } else {
        revenueByPeriod[periodKey].unpaidRevenue += invoice.total - (invoice.paidAmount || 0);
      }
    });

    // Convert to array and sort
    const revenueData = Object.values(revenueByPeriod).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    // Calculate totals
    const totals = revenueData.reduce(
      (acc, item) => ({
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        paidRevenue: acc.paidRevenue + item.paidRevenue,
        unpaidRevenue: acc.unpaidRevenue + item.unpaidRevenue,
        invoiceCount: acc.invoiceCount + item.invoiceCount,
        paidCount: acc.paidCount + item.paidCount,
      }),
      { totalRevenue: 0, paidRevenue: 0, unpaidRevenue: 0, invoiceCount: 0, paidCount: 0 }
    );

    return NextResponse.json({
      period,
      data: revenueData,
      totals,
    });
  } catch (error: any) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue report' },
      { status: 500 }
    );
  }
}

