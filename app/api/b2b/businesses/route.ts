import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

/**
 * GET /api/b2b/businesses
 *
 * B2B data API — returns filtered, bulk-exported business profiles for
 * companies with a valid API key. Gated by tier with daily rate limits.
 *
 * Auth: ?key=b2b_xxxxxxxxxx  OR  Authorization: Bearer b2b_xxxxxxxxxx
 *
 * Query params:
 *   key        - API key (alternative to Authorization header)
 *   industry   - filter by industry string (case-insensitive)
 *   state      - filter by dirState
 *   size       - filter by companySize (e.g. '1-5')
 *   active     - 'true' = only businesses active in last 30 days
 *   verified   - 'true' = only verified businesses
 *   page       - pagination (default 1)
 *   limit      - records per page (max 100 for starter, 500 for growth/enterprise)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ── Resolve API key ──────────────────────────────────────────────────────
    const rawKey =
      searchParams.get('key') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    if (!rawKey) {
      return NextResponse.json(
        { error: 'API key required. Pass ?key= or Authorization: Bearer <key>' },
        { status: 401 }
      );
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await prisma.b2BApiKey.findUnique({ where: { keyHash } });

    if (!apiKey || !apiKey.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 });
    }

    // ── Rate limiting ────────────────────────────────────────────────────────
    const now = new Date();
    const resetAge = now.getTime() - apiKey.callsResetAt.getTime();
    const needsReset = resetAge > 24 * 60 * 60 * 1000; // 24 hours

    const currentCalls = needsReset ? 0 : apiKey.callsToday;

    if (!needsReset && currentCalls >= apiKey.dailyLimit) {
      return NextResponse.json(
        {
          error: `Daily limit of ${apiKey.dailyLimit} requests reached. Resets in ${Math.ceil((24 * 3600 * 1000 - resetAge) / 3600000)}h.`,
          tier: apiKey.tier,
        },
        { status: 429 }
      );
    }

    // Increment usage (fire-and-forget)
    prisma.b2BApiKey.update({
      where: { id: apiKey.id },
      data: {
        callsToday: needsReset ? 1 : { increment: 1 },
        callsResetAt: needsReset ? now : undefined,
        lastUsedAt: now,
      },
    }).catch(() => {});

    // ── Per-tier record limit ────────────────────────────────────────────────
    const tierLimits: Record<string, number> = {
      free: 100,
      starter: 500,
      growth: 2000,
      enterprise: 10000,
    };
    const maxLimit = tierLimits[apiKey.tier] ?? 100;
    const requestedLimit = Math.min(parseInt(searchParams.get('limit') || '100'), maxLimit);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const skip = (page - 1) * requestedLimit;

    // ── Build filter ─────────────────────────────────────────────────────────
    const where: Record<string, unknown> = {
      directoryOptIn: true,
      directoryFlagged: false,
    };

    const industry = searchParams.get('industry');
    if (industry) where.industry = { contains: industry, mode: 'insensitive' };

    const state = searchParams.get('state');
    if (state) where.dirState = { contains: state, mode: 'insensitive' };

    const size = searchParams.get('size');
    if (size) where.companySize = size;

    if (searchParams.get('active') === 'true') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      where.lastActiveAt = { gte: thirtyDaysAgo };
    }

    if (searchParams.get('verified') === 'true') {
      where.verificationStatus = 'verified';
    }

    // ── Select fields — starter+ gets contact email ──────────────────────────
    const isPaidTier = ['starter', 'growth', 'enterprise'].includes(apiKey.tier);

    const select = {
      id: true,
      name: true,
      industry: true,
      businessType: true,
      companySize: true,
      dirCity: true,
      dirState: true,
      verificationStatus: true,
      directoryFeatured: true,
      directoryCategories: true,
      totalInvoiceCount: true,
      lastActiveAt: true,
      yearFounded: true,
      cacNumber: isPaidTier,   // only for paid tiers
      tinNumber: isPaidTier,
      email: isPaidTier,       // contact email only for paid tiers
      linkedinUrl: true,
      twitterUrl: true,
    };

    const [businesses, total] = await Promise.all([
      prisma.user.findMany({ where, select, skip, take: requestedLimit, orderBy: [{ directoryFeatured: 'desc' }, { lastActiveAt: 'desc' }] }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: businesses,
      meta: {
        total,
        page,
        limit: requestedLimit,
        pages: Math.ceil(total / requestedLimit),
        tier: apiKey.tier,
        dailyUsage: currentCalls + 1,
        dailyLimit: apiKey.dailyLimit,
      },
    });
  } catch (error: any) {
    console.error('[b2b/businesses] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
