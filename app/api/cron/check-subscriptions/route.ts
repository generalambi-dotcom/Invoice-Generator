import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncContactToBrevo } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

/**
 * GET — Cron endpoint to check for expired subscriptions.
 *
 * For any user whose subscriptionEndDate has passed and status is still 'active':
 *   1. Set subscriptionStatus → 'expired', subscriptionPlan → 'free'
 *   2. Update their Brevo contact to MEMBERSHIP: FREE
 *
 * Call this via Vercel Cron (every 6 hours) or an external cron service.
 * Protected by CRON_SECRET header check.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel cron or manual)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find users with expired subscriptions that haven't been downgraded yet
    const expiredUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'active',
        subscriptionEndDate: {
          lt: now, // End date has passed
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (expiredUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired subscriptions found.',
        processed: 0,
      });
    }

    console.log(`[Subscription Cron] Found ${expiredUsers.length} expired subscriptions`);

    let downgraded = 0;

    for (const user of expiredUsers) {
      try {
        // Downgrade in database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionPlan: 'free',
            subscriptionStatus: 'expired',
          },
        });

        // Update Brevo contact to free (fire-and-forget)
        syncContactToBrevo(user.email, user.name, 'free').catch(console.error);

        downgraded++;
        console.log(`[Subscription Cron] Downgraded ${user.email} to free`);
      } catch (err) {
        console.error(`[Subscription Cron] Failed to downgrade ${user.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${downgraded} expired subscriptions.`,
      processed: downgraded,
      total: expiredUsers.length,
    });
  } catch (error: any) {
    console.error('[Subscription Cron] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscriptions' },
      { status: 500 },
    );
  }
}
