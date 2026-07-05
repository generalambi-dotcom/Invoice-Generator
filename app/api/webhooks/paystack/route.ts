import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { notifyPaymentReceived } from '@/lib/payment-notifications';

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

      // ── Path B: Subscription payment (fallback activator) ─────────────────
      // The primary activation path is the /api/subscriptions/paystack-verify
      // endpoint called immediately after the Inline popup succeeds. This
      // webhook acts as a safety net in case that call failed (network issue,
      // tab closed, etc.).
      const metaUserId: string | undefined = metadata?.userId;
      const metaPlan: string | undefined = metadata?.plan || 'premium';

      if (metaUserId) {
        const targetUser = await prisma.user.findUnique({
          where: { id: metaUserId },
          select: { id: true, subscriptionStatus: true, subscriptionStartDate: true },
        });

        if (targetUser) {
          // Only activate if not already active (avoid overwriting a fresh activation)
          const alreadyActive = targetUser.subscriptionStatus === 'active';
          if (!alreadyActive) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            await prisma.user.update({
              where: { id: metaUserId },
              data: {
                subscriptionPlan: metaPlan,
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
                  metadata: { reference, plan: metaPlan, amount: amount / 100 },
                },
              });
            } catch (_) { /* non-critical */ }
          }
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

