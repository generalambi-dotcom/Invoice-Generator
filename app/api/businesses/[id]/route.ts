import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId, directoryOptIn: true },
      select: {
        id: true,
        name: true,
        industry: true,
        companySize: true,
        lastActiveAt: true,
        
        dirShowName: true,
        dirShowIndustry: true,
        dirShowLocation: true,
        dirShowSize: true,
        dirShowActivity: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Business not found or private' }, { status: 404 });
    }

    // Active logic
    let isActive = false;
    if (user.lastActiveAt) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      isActive = user.lastActiveAt >= thirtyDaysAgo;
    }

    // Sanitize output exactly as the list does
    const sanitizedBusiness = {
      id: user.id,
      name: user.dirShowName ? user.name : 'Anonymous Business',
      industry: user.dirShowIndustry ? user.industry : null,
      size: user.dirShowSize ? user.companySize : null,
      location: user.dirShowLocation ? 'Lagos, Nigeria' : null, // Defaulted for UI
      isActive: user.dirShowActivity ? isActive : null, 
    };

    // Record a real profile view event (fire-and-forget)
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    prisma.directoryEvent.create({
      data: {
        type: 'profile_view',
        businessId: user.id,
        visitorIp,
      }
    }).catch(() => {}); // Non-blocking

    return NextResponse.json({ business: sanitizedBusiness });

  } catch (error) {
    console.error('Failed to fetch business directory profile:', error);
    return NextResponse.json({ error: 'Failed to load business profile' }, { status: 500 });
  }
}
