import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get pricing for a specific region (public endpoint)
 * Accepts optional ?region=nigeria or ?region=rest-of-world query param
 * If no region provided, returns default pricing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'default';
    
    // Normalize region
    const normalizedRegion = ['nigeria', 'rest-of-world'].includes(region) 
      ? region 
      : 'default';

    // Get pricing setting for region, fallback to default
    let pricingSetting = await prisma.pricingSettings.findUnique({
      where: { region: normalizedRegion },
    });

    // If region not found and not default, try default
    if (!pricingSetting && normalizedRegion !== 'default') {
      pricingSetting = await prisma.pricingSettings.findUnique({
        where: { region: 'default' },
      });
    }

    // If still no pricing, return default values
    if (!pricingSetting) {
      return NextResponse.json({
        region: normalizedRegion,
        premiumPrice: normalizedRegion === 'nigeria' ? 3000 : 9.99,
        currency: normalizedRegion === 'nigeria' ? 'NGN' : 'USD',
        isActive: true,
      });
    }

    return NextResponse.json({
      region: pricingSetting.region,
      premiumPrice: pricingSetting.premiumPrice,
      currency: pricingSetting.currency,
      isActive: pricingSetting.isActive,
    });
  } catch (error: any) {
    console.error('Error fetching pricing:', error);
    // Return default values on error
    return NextResponse.json({
      region: 'default',
      premiumPrice: 9.99,
      currency: 'USD',
      isActive: true,
    });
  }
}

