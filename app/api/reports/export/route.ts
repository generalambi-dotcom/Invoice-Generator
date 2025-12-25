import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Export report data to CSV
 * Body: { reportType, data, filename }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { reportType, data, filename } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Convert data to CSV
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 400 }
      );
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    // Convert rows to CSV
    const csvRows = data.map((row: any) =>
      headers.map((header) => {
        const value = row[header];
        // Escape commas and quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );

    const csv = [csvHeaders, ...csvRows].join('\n');

    // Return CSV as response
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename || 'report'}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

