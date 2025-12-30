import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

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
        const plan = metadata.plan;
        const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents

        // Update user subscription
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days subscription

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

        console.log(`✅ Subscription activated for user ${userId} via Stripe: ${session.id}`);

        // Note: Payment model requires invoiceId, but subscriptions don't have invoices
        // The subscription status is already updated above, which is the important part
        // Payment records are primarily for invoice payments, not subscriptions
        console.log(`💳 Subscription payment: ${amount} ${session.currency?.toUpperCase() || 'USD'} for user ${userId}`);
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

