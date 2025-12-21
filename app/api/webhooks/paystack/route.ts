import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// POST - Handle Paystack webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (secret && signature) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (hash !== signature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const { event, data } = body;

    if (event === 'charge.success') {
      // Payment successful
      const { reference, amount, customer, metadata } = data;
      
      // Find payment by reference
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { invoice: true },
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            paidAt: new Date(),
            transactionId: data.id?.toString(),
            providerData: data,
          },
        });

        // Update invoice
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paymentStatus: 'paid',
            paidAmount: amount / 100, // Paystack amounts are in kobo/pesewas
            paymentDate: new Date(),
          },
        });
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

