import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

/**
 * GET /api/b2b/leads
 *
 * B2B Lead Marketplace — returns live inbound lead enquiries.
 * PII (name/email/phone) is gated: only revealed to growth/enterprise tier keys.
 *
 * Query params:
 *   key        - API key
 *   industry   - filter by industry
 *   state      - filter by location state
 *   status     - 'open' (default) | 'closed' | 'all'
 *   since      - ISO date string — only leads created after this date
 *   page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ── API key auth ─────────────────────────────────────────────────────────
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

    // ── Rate limiting (shared with businesses endpoint via daily counter) ────
    const now = new Date();
    const resetAge = now.getTime() - apiKey.callsResetAt.getTime();
    const needsReset = resetAge > 24 * 60 * 60 * 1000;
    const currentCalls = needsReset ? 0 : apiKey.callsToday;

    if (!needsReset && currentCalls >= apiKey.dailyLimit) {
      return NextResponse.json(
        { error: `Daily limit of ${apiKey.dailyLimit} requests reached.` },
        { status: 429 }
      );
    }

    prisma.b2BApiKey.update({
      where: { id: apiKey.id },
      data: {
        callsToday: needsReset ? 1 : { increment: 1 },
        callsResetAt: needsReset ? now : undefined,
        lastUsedAt: now,
      },
    }).catch(() => {});

    // ── PII access — growth/enterprise only ──────────────────────────────────
    const hasPiiAccess = ['growth', 'enterprise'].includes(apiKey.tier);

    // ── Build filter ─────────────────────────────────────────────────────────
    const where: Record<string, unknown> = {};

    const statusParam = searchParams.get('status') || 'open';
    if (statusParam !== 'all') where.status = statusParam;

    const industry = searchParams.get('industry');
    if (industry) where.industry = { contains: industry, mode: 'insensitive' };

    const state = searchParams.get('state');
    if (state) where.locationState = { contains: state, mode: 'insensitive' };

    const since = searchParams.get('since');
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        where.createdAt = { gte: sinceDate };
      }
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.leadEnquiry.findMany({
        where,
        select: {
          id: true,
          industry: true,
          serviceReq: true,
          locationCity: true,
          locationState: true,
          isRemote: true,
          urgency: true,
          status: true,
          currentResponses: true,
          maxResponses: true,
          createdAt: true,
          // PII gated
          customerName: hasPiiAccess,
          customerEmail: hasPiiAccess,
          customerPhone: hasPiiAccess,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leadEnquiry.count({ where }),
    ]);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        tier: apiKey.tier,
        piiAccess: hasPiiAccess,
        note: hasPiiAccess
          ? 'Customer PII included (growth/enterprise tier)'
          : 'Upgrade to growth or enterprise tier to access customer contact details.',
      },
    });
  } catch (error: any) {
    console.error('[b2b/leads] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
