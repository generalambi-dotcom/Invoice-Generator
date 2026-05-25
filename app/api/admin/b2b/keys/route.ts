import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import crypto from 'crypto';

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 5000,
  enterprise: 100000,
};

/**
 * GET /api/admin/b2b/keys — list all B2B API keys
 * POST /api/admin/b2b/keys — generate a new B2B API key
 */
export async function GET(request: NextRequest) {
  try {
    const admin = getAuthenticatedUser(request);
    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await prisma.b2BApiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        email: true,
        keyPrefix: true,
        tier: true,
        dailyLimit: true,
        callsToday: true,
        callsResetAt: true,
        isActive: true,
        notes: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return NextResponse.json({ keys });
  } catch (error: any) {
    console.error('[admin/b2b/keys] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAuthenticatedUser(request);
    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, email, tier = 'free', notes } = body as {
      companyName: string;
      email: string;
      tier?: string;
      notes?: string;
    };

    if (!companyName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'companyName and email are required' }, { status: 400 });
    }

    if (!TIER_LIMITS[tier]) {
      return NextResponse.json(
        { error: `tier must be one of: ${Object.keys(TIER_LIMITS).join(', ')}` },
        { status: 400 }
      );
    }

    // Generate a secure random key:  b2b_ + 32 random hex chars
    const rawKey = `b2b_${crypto.randomBytes(16).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12); // b2b_xxxxxxxx

    const apiKey = await prisma.b2BApiKey.create({
      data: {
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        keyHash,
        keyPrefix,
        tier,
        dailyLimit: TIER_LIMITS[tier],
        notes: notes?.trim() || null,
      },
    });

    // Return the full raw key ONLY on creation — it is never stored in plain text
    return NextResponse.json(
      {
        success: true,
        message: 'API key created. Copy the key now — it will not be shown again.',
        key: rawKey, // ← only time this is returned
        keyPrefix,
        id: apiKey.id,
        tier,
        dailyLimit: TIER_LIMITS[tier],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[admin/b2b/keys] POST error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
