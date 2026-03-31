import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { syncAllUsersToBrevo } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

/**
 * POST — Trigger a bulk sync of ALL registered users to the Brevo active‑customer list.
 * Admin‑only.
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[Brevo Sync] Bulk sync triggered by admin ${user.userId}`);
    const result = await syncAllUsersToBrevo();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully queued ${result.synced} contacts for sync to Brevo.`,
        total: result.total,
        synced: result.synced,
        failed: result.failed,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Bulk sync failed',
        total: result.total,
        synced: result.synced,
        failed: result.failed,
      },
      { status: 500 },
    );
  } catch (error: any) {
    console.error('[Brevo Sync] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sync' },
      { status: 500 },
    );
  }
}
