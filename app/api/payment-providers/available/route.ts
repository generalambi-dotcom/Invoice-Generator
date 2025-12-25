import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get user's available payment providers (with active credentials)
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active payment credentials
    const credentials = await prisma.paymentCredential.findMany({
      where: {
        userId: user.userId,
        isActive: true,
      },
      select: {
        provider: true,
        isTestMode: true,
        createdAt: true,
      },
    });

    // Get default payment provider from CompanyDefaults
    const defaults = await prisma.companyDefaults.findUnique({
      where: { userId: user.userId },
      select: { defaultPaymentProvider: true },
    });

    return NextResponse.json({
      providers: credentials.map(c => ({
        provider: c.provider,
        isTestMode: c.isTestMode,
        createdAt: c.createdAt,
      })),
      defaultProvider: defaults?.defaultPaymentProvider || null,
    });
  } catch (error: any) {
    console.error('Error fetching available payment providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment providers' },
      { status: 500 }
    );
  }
}

