import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get user's company defaults
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

    const defaults = await prisma.companyDefaults.findUnique({
      where: { userId: user.userId },
    });

    if (!defaults) {
      return NextResponse.json({ defaults: null });
    }

    return NextResponse.json({ defaults });
  } catch (error: any) {
    console.error('Error loading company defaults:', error);
    return NextResponse.json(
      { error: 'Failed to load company defaults' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update company defaults
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

    const body = await request.json();
    const {
      companyInfo,
      defaultCurrency,
      defaultTheme,
      defaultTaxRate,
      defaultNotes,
      defaultBankDetails,
      defaultTerms,
    } = body;

    // Validation
    if (!companyInfo) {
      return NextResponse.json(
        { error: 'Company information is required' },
        { status: 400 }
      );
    }

    // Upsert company defaults
    const defaults = await prisma.companyDefaults.upsert({
      where: { userId: user.userId },
      update: {
        companyInfo,
        defaultCurrency: defaultCurrency || 'USD',
        defaultTheme: defaultTheme || 'slate',
        defaultTaxRate: defaultTaxRate || 0,
        defaultNotes: defaultNotes || null,
        defaultBankDetails: defaultBankDetails || null,
        defaultTerms: defaultTerms || null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.userId,
        companyInfo,
        defaultCurrency: defaultCurrency || 'USD',
        defaultTheme: defaultTheme || 'slate',
        defaultTaxRate: defaultTaxRate || 0,
        defaultNotes: defaultNotes || null,
        defaultBankDetails: defaultBankDetails || null,
        defaultTerms: defaultTerms || null,
      },
    });

    return NextResponse.json({
      defaults,
      message: 'Company defaults saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving company defaults:', error);
    return NextResponse.json(
      { error: 'Failed to save company defaults' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete company defaults
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.companyDefaults.deleteMany({
      where: { userId: user.userId },
    });

    return NextResponse.json({
      message: 'Company defaults deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting company defaults:', error);
    return NextResponse.json(
      { error: 'Failed to delete company defaults' },
      { status: 500 }
    );
  }
}

