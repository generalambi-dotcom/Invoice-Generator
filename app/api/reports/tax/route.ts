import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get tax reports
 * Query params: startDate, endDate, groupBy (month|quarter|year)
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'month';

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get all invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.userId,
        paymentStatus: { not: 'cancelled' },
        ...(Object.keys(dateFilter).length > 0 && { invoiceDate: dateFilter }),
        taxAmount: { gt: 0 },
      },
      orderBy: { invoiceDate: 'asc' },
    });

    // Group by period
    const taxByPeriod: Record<string, {
      period: string;
      totalTax: number;
      totalRevenue: number;
      invoiceCount: number;
      averageTaxRate: number;
    }> = {};

    invoices.forEach((invoice) => {
      let periodKey = '';
      const date = new Date(invoice.invoiceDate);

      switch (groupBy) {
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          periodKey = String(date.getFullYear());
          break;
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!taxByPeriod[periodKey]) {
        taxByPeriod[periodKey] = {
          period: periodKey,
          totalTax: 0,
          totalRevenue: 0,
          invoiceCount: 0,
          averageTaxRate: 0,
        };
      }

      taxByPeriod[periodKey].totalTax += invoice.taxAmount;
      taxByPeriod[periodKey].totalRevenue += invoice.total;
      taxByPeriod[periodKey].invoiceCount += 1;
    });

    // Calculate averages
    Object.values(taxByPeriod).forEach((period) => {
      period.averageTaxRate = period.totalRevenue > 0
        ? (period.totalTax / period.totalRevenue) * 100
        : 0;
    });

    // Convert to array and sort
    const taxData = Object.values(taxByPeriod).sort((a, b) =>
      a.period.localeCompare(b.period)
    );

    // Calculate totals
    const totals = taxData.reduce(
      (acc, item) => ({
        totalTax: acc.totalTax + item.totalTax,
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        invoiceCount: acc.invoiceCount + item.invoiceCount,
      }),
      { totalTax: 0, totalRevenue: 0, invoiceCount: 0 }
    );

    const overallTaxRate = totals.totalRevenue > 0
      ? (totals.totalTax / totals.totalRevenue) * 100
      : 0;

    return NextResponse.json({
      groupBy,
      data: taxData,
      totals: {
        ...totals,
        overallTaxRate,
      },
    });
  } catch (error: any) {
    console.error('Error generating tax report:', error);
    return NextResponse.json(
      { error: 'Failed to generate tax report' },
      { status: 500 }
    );
  }
}

