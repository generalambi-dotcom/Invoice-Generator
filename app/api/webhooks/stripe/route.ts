import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { syncContactToBrevo } from '@/lib/brevo';
import { notifyPaymentReceived } from '@/lib/payment-notifications';

// POST - Handle Stripe webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing webhook secret' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-12-15.clover',
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle subscription payments
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata?.type === 'subscription' && metadata?.userId && metadata?.plan) {
        const userId = metadata.userId;
        const plan = metadata.plan; // tier: 'pro' | 'business'
        const interval = metadata.interval === 'annual' ? 'annual' : 'monthly';
        const isTrial = metadata.isTrial === 'true';
        const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents

        // Period length: trial → 30 days; otherwise interval-based. Renewals
        // extend it via the invoice.paid handler below.
        const periodDays = isTrial ? 30 : interval === 'annual' ? 365 : 30;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + periodDays);

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date(),
            subscriptionEndDate: endDate,
            subscriptionPaymentMethod: 'stripe',
          },
        });

        console.log(`✅ Subscription activated for user ${userId} via Stripe (${plan}/${interval}): ${session.id}`);

        // Update Brevo contact to premium (fire-and-forget)
        const updatedUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
        if (updatedUser) {
          syncContactToBrevo(updatedUser.email, updatedUser.name, 'premium').catch(console.error);
        }

        // Note: Payment model requires invoiceId, but subscriptions don't have invoices
        // The subscription status is already updated above, which is the important part
        // Payment records are primarily for invoice payments, not subscriptions
        console.log(`💳 Subscription payment: ${amount} ${session.currency?.toUpperCase() || 'USD'} for user ${userId}`);
      }
    }

    // ── Subscription renewal ──────────────────────────────────────────────────
    // Stripe fires invoice.paid on every subscription charge. The first one
    // (billing_reason 'subscription_create') is already handled by
    // checkout.session.completed; only extend on subsequent cycles.
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const billingReason = (invoice as any).billing_reason;

      if (billingReason === 'subscription_cycle') {
        // Prefer subscription metadata; fall back to the invoice's customer email.
        let userId: string | undefined;
        let interval: 'monthly' | 'annual' = 'monthly';
        const subId = (invoice as any).subscription as string | undefined;

        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            userId = sub.metadata?.userId;
            interval = sub.metadata?.interval === 'annual' ? 'annual' : 'monthly';
          } catch (e) {
            console.error('Failed to retrieve Stripe subscription for renewal:', e);
          }
        }

        // Derive interval from the line item if metadata was missing.
        const lineInterval = (invoice.lines?.data?.[0] as any)?.price?.recurring?.interval;
        if (lineInterval) interval = lineInterval === 'year' ? 'annual' : 'monthly';

        const email = (invoice as any).customer_email as string | undefined;
        const subUser = userId
          ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, subscriptionEndDate: true } })
          : email
          ? await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, subscriptionEndDate: true } })
          : null;

        if (subUser) {
          const periodDays = interval === 'annual' ? 365 : 30;
          const base =
            subUser.subscriptionEndDate && subUser.subscriptionEndDate > new Date()
              ? new Date(subUser.subscriptionEndDate)
              : new Date();
          base.setDate(base.getDate() + periodDays);

          await prisma.user.update({
            where: { id: subUser.id },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndDate: base,
              subscriptionPaymentMethod: 'stripe',
            },
          });
          console.log(`🔁 Stripe subscription renewed for user ${subUser.id} (${interval})`);
        }
      }
    }

    // ── Subscription cancellation ─────────────────────────────────────────────
    // Access is kept until subscriptionEndDate; the check-subscriptions cron
    // downgrades to Free once it passes.
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const subUser = userId
        ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
        : null;
      if (subUser) {
        await prisma.user.update({
          where: { id: subUser.id },
          data: { subscriptionStatus: 'cancelled' },
        });
        console.log(`⚠️ Stripe subscription cancelled for user ${subUser.id}`);
      }
    }

    // Handle invoice payments
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata?.invoiceId;

      if (invoiceId) {
        // Find payment
        const payment = await prisma.payment.findFirst({
          where: {
            invoiceId,
            transactionId: paymentIntent.id,
          },
          include: { invoice: true },
        });

        if (payment) {
          const wasAlreadyPaid = payment.invoice?.paymentStatus === 'paid';

          // Update payment
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              paidAt: new Date(),
              providerData: paymentIntent as any,
            },
          });

          // Update invoice
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              paymentStatus: 'paid',
              paidAmount: paymentIntent.amount / 100, // Stripe amounts are in cents
              paymentDate: new Date(),
            },
          });

          // Fire payment emails (owner notification + client receipt). The
          // EmailLog dedupe inside the helper guards against webhook retries.
          if (!wasAlreadyPaid) {
            notifyPaymentReceived(invoiceId).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

