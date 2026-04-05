import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';
import { logRequest } from '@/lib/request-logger';

// Check if a business is active based on real activity data gravity
// "Active" means lastActiveAt is within the last 30 days
const isBusinessActive = (lastActiveAt: Date | null) => {
  if (!lastActiveAt) return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return lastActiveAt >= thirtyDaysAgo;
};

// GET /api/businesses - Public directory listing (with privacy controls enforced)
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limit public endpoints closely to prevent scraping
    const identifier = getClientIdentifier(request);
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);

    if (!limitResult.allowed) {
      logRequest(request, { statusCode: 429, responseTime: Date.now() - startTime });
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const size = searchParams.get('size');
    const status = searchParams.get('status');
    const queryTerm = searchParams.get('q');

    // ONLY queried users who have explicitly opted into the directory
    const whereClause: any = {
      directoryOptIn: true
    };

    if (queryTerm) {
      whereClause.OR = [
        { name: { contains: queryTerm, mode: 'insensitive' } },
        { industry: { contains: queryTerm, mode: 'insensitive' } }
      ];
    }

    if (industry) {
      whereClause.industry = industry;
    }

    if (size) {
      whereClause.companySize = size;
    }

    // Fetch the base profiles
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        industry: true,
        companySize: true,
        lastActiveAt: true,
        
        // Fetch privacy flags so we know what to hide
        dirShowName: true,
        dirShowIndustry: true,
        dirShowLocation: true,
        dirShowSize: true,
        dirShowActivity: true,
        
        // We will mock state extraction from somewhere later or leave generic
        publicSlug: true
      },
      orderBy: {
        businessPulseScore: 'desc' // highest engaged users first
      },
      take: 200 // Max 200 for MVP
    });

    // Map through and strictly enforce their privacy choices
    const sanitizedBusinesses = users.map(user => {
      const isActuallyActive = isBusinessActive(user.lastActiveAt);

      // Status filter bypasses if they set 'active' but we hide it via their own rules
      return {
        id: user.id, // Only internal ID, not emails or PII
        // If showName is false, replace Name entirely
        name: user.dirShowName ? user.name : 'Anonymous Business',
        industry: user.dirShowIndustry ? user.industry : null,
        size: user.dirShowSize ? user.companySize : null,
        // For Location, if it's stored in CompanyDefaults we might fetch it later, for now we will stub it to "Nigeria"
        location: user.dirShowLocation ? 'Nigeria' : null,
        isActive: user.dirShowActivity ? isActuallyActive : null, 
      };
    }).filter(biz => {
      // If the client requested 'active' status filter, enforce it
      if (status === 'active' && biz.isActive !== true) return false;
      return true;
    });

    // Record search_appearance for each business that appeared (fire-and-forget)
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (sanitizedBusinesses.length > 0) {
      prisma.directoryEvent.createMany({
        data: sanitizedBusinesses.map(biz => ({
          type: 'search_appearance',
          businessId: biz.id,
          visitorIp,
        }))
      }).catch(() => {}); // Non-blocking
    }

    return NextResponse.json({ 
      businesses: sanitizedBusinesses,
      total: sanitizedBusinesses.length
    });

  } catch (error) {
    console.error('Failed to fetch business directory:', error);
    return NextResponse.json({ error: 'Failed to load directory' }, { status: 500 });
  }
}
