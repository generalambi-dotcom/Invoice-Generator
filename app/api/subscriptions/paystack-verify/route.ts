import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { decryptPaymentCredential } from '@/lib/encryption';
import { syncContactToBrevo } from '@/lib/brevo';
import { notifySubscriptionEvent } from '@/lib/subscription-notifications';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Verify Paystack transaction and activate subscription
 *
 * Called immediately after Paystack Inline popup succeeds (client callback).
 * A fallback activation also happens via the Paystack webhook (charge.success).
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reference, userId, plan, interval } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    // Validate the userId matches the authenticated user
    if (userId && userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const resolvedUserId = userId || user.userId;

    // ── Get Paystack secret key ────────────────────────────────────────────────
    let paystackSecretKey: string | undefined = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
        orderBy: { createdAt: 'asc' },
      });

      if (adminUser) {
        const credential = await prisma.paymentCredential.findUnique({
          where: {
            userId_provider: {
              userId: adminUser.id,
              provider: 'paystack',
            },
          },
        });

        if (credential?.secretKey && credential.isActive) {
          try {
            const decrypted = decryptPaymentCredential({ secretKey: credential.secretKey });
            paystackSecretKey = decrypted.secretKey || undefined;
          } catch (decryptError) {
            console.error('Error decrypting Paystack secret key:', decryptError);
          }
        }
      }
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Paystack is not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // ── Verify transaction with Paystack API ──────────────────────────────────
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      console.error('Paystack verification failed:', verifyData);
      return NextResponse.json(
        { error: 'Payment verification failed', details: verifyData.message },
        { status: 400 }
      );
    }

    const txData = verifyData.data;

    // ── Validate metadata ─────────────────────────────────────────────────────
    const metaUserId = txData.metadata?.userId;
    if (metaUserId && metaUserId !== resolvedUserId) {
      console.error(`User mismatch: metadata.userId=${metaUserId}, authenticated=${resolvedUserId}`);
      return NextResponse.json({ error: 'Payment user mismatch' }, { status: 403 });
    }

    const resolvedPlan = plan || txData.metadata?.plan || 'pro';
    const resolvedInterval = interval || txData.metadata?.interval || 'monthly';

    // ── Idempotency: check if already activated for this reference ────────────
    const existing = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      select: { subscriptionStatus: true, subscriptionStartDate: true },
    });

    // ── Activate subscription in database ────────────────────────────────────
    // Period length follows the billing interval (Paystack auto-renews via the
    // plan; the webhook extends the end date on each renewal charge.success).
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (resolvedInterval === 'annual' ? 365 : 30));

    await prisma.user.update({
      where: { id: resolvedUserId },
      data: {
        subscriptionPlan: resolvedPlan,
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionPaymentMethod: 'paystack',
      },
    });

    // ── Log payment record ────────────────────────────────────────────────────
    try {
      await prisma.systemLog.create({
        data: {
          level: 'info',
          category: 'payment',
          message: `Paystack subscription activated for user ${resolvedUserId}`,
          metadata: {
            reference,
            plan: resolvedPlan,
            amount: txData.amount / 100,
            currency: txData.currency,
            channel: txData.channel,
            paidAt: txData.paid_at,
          },
        },
      });
    } catch (logErr) {
      console.error('Failed to write system log:', logErr);
    }

    console.log(`✅ Paystack subscription activated for user ${resolvedUserId}: ref=${reference}`);

    // ── Sync Brevo CRM (fire-and-forget) ─────────────────────────────────────
    const updatedUser = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      select: { email: true, name: true },
    });
    if (updatedUser) {
      syncContactToBrevo(updatedUser.email, updatedUser.name, resolvedPlan).catch(console.error);
    }
    await notifySubscriptionEvent(resolvedUserId, existing?.subscriptionStatus === 'active' ? 'renewed' : 'activated', reference);

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error: any) {
    console.error('Error verifying Paystack payment:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
