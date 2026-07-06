import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { notifyPaymentReceived } from '@/lib/payment-notifications';
import { PAYSTACK_PLAN_CODES } from '@/lib/plans';

/** Reverse-lookup a Paystack plan code → our tier + interval. */
function tierIntervalFromPlanCode(
  code?: string
): { tier?: 'pro' | 'business'; interval?: 'monthly' | 'annual' } {
  if (!code) return {};
  for (const tier of ['pro', 'business'] as const) {
    for (const interval of ['monthly', 'annual'] as const) {
      if (PAYSTACK_PLAN_CODES[tier][interval] === code) return { tier, interval };
    }
  }
  return {};
}

/** Normalise Paystack's interval string ('monthly' | 'annually' | …) to ours. */
function normalisePaystackInterval(paystackInterval?: string): 'monthly' | 'annual' {
  return paystackInterval === 'annually' || paystackInterval === 'annual' ? 'annual' : 'monthly';
}

// POST - Handle Paystack webhook
export async function POST(request: NextRequest) {
  try {
    // Read the raw body so the signature is computed over the exact bytes
    // Paystack signed, rather than a re-serialized object.
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature — ALWAYS required. Without this, anyone could
    // POST a fake charge.success event and mark invoices as paid.
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is not set; rejecting webhook.');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to avoid timing attacks.
    const expected = Buffer.from(hash);
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (event === 'charge.success') {
      const { reference, amount, customer, metadata } = data;

      // ── Path A: Invoice payment ───────────────────────────────────────────
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { invoice: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            paidAt: new Date(),
            transactionId: data.id?.toString(),
            providerData: data,
          },
        });

        const wasAlreadyPaid = payment.invoice?.paymentStatus === 'paid';

        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paymentStatus: 'paid',
            paidAmount: amount / 100, // kobo → naira
            paymentDate: new Date(),
          },
        });

        // Fire payment emails (owner notification + client receipt). The
        // EmailLog dedupe inside the helper also guards against webhook retries.
        if (!wasAlreadyPaid) {
          notifyPaymentReceived(payment.invoiceId).catch(() => {});
        }

        console.log(`✅ Invoice payment confirmed via webhook: ref=${reference}`);
      }

      // Derive tier + interval from the plan code (present on subscription
      // charges) or from the metadata we set on the initial Inline checkout.
      const planCode: string | undefined =
        (typeof data.plan === 'string' ? data.plan : data.plan?.plan_code) ||
        data.plan_object?.plan_code;
      const fromCode = tierIntervalFromPlanCode(planCode);
      const tier = (metadata?.plan || fromCode.tier || 'pro') as string;
      const interval =
        (metadata?.interval as 'monthly' | 'annual') ||
        fromCode.interval ||
        normalisePaystackInterval(data.plan?.interval || data.plan_object?.interval);
      const periodDays = interval === 'annual' ? 365 : 30;

      const metaUserId: string | undefined = metadata?.userId;

      if (metaUserId) {
        // ── Path B: Initial subscription activation (fallback for verify) ────
        // Primary activation is /api/subscriptions/paystack-verify; this is the
        // safety net if that call failed. Skip if already active to avoid
        // double-counting the same first charge.
        const targetUser = await prisma.user.findUnique({
          where: { id: metaUserId },
          select: { id: true, subscriptionStatus: true },
        });

        if (targetUser && targetUser.subscriptionStatus !== 'active') {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + periodDays);

          await prisma.user.update({
            where: { id: metaUserId },
            data: {
              subscriptionPlan: tier,
              subscriptionStatus: 'active',
              subscriptionStartDate: new Date(),
              subscriptionEndDate: endDate,
              subscriptionPaymentMethod: 'paystack',
            },
          });

          console.log(`✅ Subscription activated via webhook fallback for user ${metaUserId}: ref=${reference}`);
          try {
            await prisma.systemLog.create({
              data: {
                level: 'info',
                category: 'payment',
                message: `Paystack subscription activated via webhook for user ${metaUserId}`,
                metadata: { reference, plan: tier, interval, amount: amount / 100 },
              },
            });
          } catch (_) { /* non-critical */ }
        }
      } else if (planCode) {
        // ── Path C: Recurring renewal ───────────────────────────────────────
        // Renewal charges are initiated by Paystack and carry no metadata, so
        // match by customer email and extend the current period.
        // NOTE(idempotency): we return 200 so Paystack won't retry; if you see
        // duplicate extensions, add a processed-reference guard.
        const email: string | undefined = customer?.email;
        if (email) {
          const subUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, subscriptionEndDate: true },
          });

          if (subUser) {
            // Extend from the later of "now" or the existing end date.
            const base =
              subUser.subscriptionEndDate && subUser.subscriptionEndDate > new Date()
                ? new Date(subUser.subscriptionEndDate)
                : new Date();
            base.setDate(base.getDate() + periodDays);

            await prisma.user.update({
              where: { id: subUser.id },
              data: {
                subscriptionPlan: tier,
                subscriptionStatus: 'active',
                subscriptionEndDate: base,
                subscriptionPaymentMethod: 'paystack',
              },
            });

            console.log(`🔁 Subscription renewed via webhook for ${email}: ref=${reference}`);
            try {
              await prisma.systemLog.create({
                data: {
                  level: 'info',
                  category: 'payment',
                  message: `Paystack subscription renewed for ${email}`,
                  metadata: { reference, plan: tier, interval, amount: amount / 100 },
                },
              });
            } catch (_) { /* non-critical */ }
          }
        }
      }
    }

    // ── Subscription cancellation / non-renewal ───────────────────────────────
    // Access is kept until the current period end; the check-subscriptions cron
    // downgrades to Free once subscriptionEndDate passes.
    if (event === 'subscription.disable' || event === 'subscription.not_renew') {
      const email: string | undefined = data?.customer?.email;
      if (email) {
        const subUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true },
        });
        if (subUser) {
          await prisma.user.update({
            where: { id: subUser.id },
            data: { subscriptionStatus: 'cancelled' },
          });
          console.log(`⚠️ Paystack subscription ${event} for ${email}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

