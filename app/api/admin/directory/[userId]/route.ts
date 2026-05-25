import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

/**
 * PATCH /api/admin/directory/[userId]
 * Admin actions: verify, feature, flag, hide/unhide a business in the directory.
 *
 * Body: one or more of:
 *   { action: 'verify' | 'reject' | 'feature' | 'unfeature' | 'flag' | 'unflag' | 'hide' | 'unhide', notes?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = getAuthenticatedUser(request);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notes } = body as {
      action: 'verify' | 'reject' | 'pending' | 'feature' | 'unfeature' | 'flag' | 'unflag' | 'hide' | 'unhide';
      notes?: string;
    };

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    // Check the business exists
    const business = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Build update payload based on action
    const updateData: Record<string, unknown> = {};

    switch (action) {
      case 'verify':
        updateData.verificationStatus = 'verified';
        if (notes) updateData.verificationNotes = notes;
        break;

      case 'reject':
        updateData.verificationStatus = 'rejected';
        if (notes) updateData.verificationNotes = notes;
        break;

      case 'pending':
        updateData.verificationStatus = 'pending';
        if (notes) updateData.verificationNotes = notes;
        break;

      case 'feature':
        updateData.directoryFeatured = true;
        break;

      case 'unfeature':
        updateData.directoryFeatured = false;
        break;

      case 'flag':
        updateData.directoryFlagged = true;
        if (notes) updateData.verificationNotes = notes;
        break;

      case 'unflag':
        updateData.directoryFlagged = false;
        break;

      case 'hide':
        // Hide = opt them out of directory without losing their settings
        updateData.directoryOptIn = false;
        if (notes) updateData.verificationNotes = notes;
        break;

      case 'unhide':
        updateData.directoryOptIn = true;
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        verificationNotes: true,
        directoryFeatured: true,
        directoryFlagged: true,
        directoryOptIn: true,
      },
    });

    console.log(`[admin/directory] ${action} applied to ${business.email} by admin ${admin.userId}`);

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    console.error('[admin/directory/[userId]] Error:', error);
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }
}

/** GET /api/admin/directory/[userId] — fetch full business detail for admin */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = getAuthenticatedUser(request);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        industry: true,
        businessType: true,
        companySize: true,
        dirCity: true,
        dirState: true,
        cacNumber: true,
        tinNumber: true,
        directoryOptIn: true,
        verificationStatus: true,
        verificationNotes: true,
        directoryFeatured: true,
        directoryFlagged: true,
        directoryCategories: true,
        directoryTier: true,
        directoryTierExpiresAt: true,
        totalInvoiceCount: true,
        lastActiveAt: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: { businessReviews: { where: { approved: true } } },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    console.error('[admin/directory/[userId]] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}
