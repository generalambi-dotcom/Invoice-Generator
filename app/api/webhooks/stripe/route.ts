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

