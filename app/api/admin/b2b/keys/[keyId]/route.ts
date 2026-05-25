import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 5000,
  enterprise: 100000,
};

/** PATCH /api/admin/b2b/keys/[keyId] — update tier, activate/deactivate, add notes */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const admin = getAuthenticatedUser(request);
    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, tier, notes } = body as {
      isActive?: boolean;
      tier?: string;
      notes?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (tier) {
      if (!TIER_LIMITS[tier]) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
      updateData.tier = tier;
      updateData.dailyLimit = TIER_LIMITS[tier];
    }
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.b2BApiKey.update({
      where: { id: params.keyId },
      data: updateData,
      select: {
        id: true, companyName: true, email: true, keyPrefix: true,
        tier: true, dailyLimit: true, isActive: true, notes: true,
      },
    });

    return NextResponse.json({ success: true, key: updated });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    console.error('[admin/b2b/keys/[keyId]] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
  }
}

/** DELETE /api/admin/b2b/keys/[keyId] — permanently revoke and delete a key */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const admin = getAuthenticatedUser(request);
    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.b2BApiKey.delete({ where: { id: params.keyId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    console.error('[admin/b2b/keys/[keyId]] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
