import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get pricing settings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all pricing settings
    const pricingSettings = await prisma.pricingSettings.findMany({
      orderBy: { region: 'asc' },
    });

    return NextResponse.json({ pricingSettings });
  } catch (error: any) {
    console.error('Error fetching pricing settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update pricing settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { region, premiumPrice, currency, isActive } = body;

    // Validation
    if (!region || !['nigeria', 'rest-of-world', 'default'].includes(region)) {
      return NextResponse.json(
        { error: 'Invalid region. Must be: nigeria, rest-of-world, or default' },
        { status: 400 }
      );
    }

    if (typeof premiumPrice !== 'number' || premiumPrice < 0) {
      return NextResponse.json(
        { error: 'Premium price must be a positive number' },
        { status: 400 }
      );
    }

    if (!currency || !['USD', 'NGN'].includes(currency)) {
      return NextResponse.json(
        { error: 'Currency must be USD or NGN' },
        { status: 400 }
      );
    }

    // Upsert pricing setting
    const pricingSetting = await prisma.pricingSettings.upsert({
      where: { region },
      update: {
        premiumPrice,
        currency,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
      create: {
        region,
        premiumPrice,
        currency,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      pricingSetting,
      message: 'Pricing setting updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating pricing settings:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing settings' },
      { status: 500 }
    );
  }
}

