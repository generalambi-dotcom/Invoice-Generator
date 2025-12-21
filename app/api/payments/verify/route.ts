import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Verify payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, reference, invoiceId } = body;

    if (!provider || !reference || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get invoice and payment credentials
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: {
          include: {
            paymentCredentials: {
              where: { provider, isActive: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const credential = invoice.user.paymentCredentials[0];
    if (!credential) {
      return NextResponse.json(
        { error: 'Payment credentials not found' },
        { status: 400 }
      );
    }

    // Verify payment with provider
    let paymentData: any;

    if (provider === 'paystack') {
      // Verify with Paystack
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${credential.secretKey}`,
        },
      });
      const data = await response.json();
      
      if (data.status && data.data.status === 'success') {
        paymentData = data.data;
      } else {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    } else if (provider === 'stripe') {
      // Verify with Stripe
      const Stripe = require('stripe');
      const stripe = new Stripe(credential.secretKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(reference);
      
      if (paymentIntent.status === 'succeeded') {
        paymentData = paymentIntent;
      } else {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        userId: invoice.userId,
        amount: invoice.total,
        currency: invoice.currency,
        provider,
        transactionId: paymentData.id?.toString() || paymentData.reference,
        reference: reference,
        status: 'completed',
        paidAt: new Date(),
        providerData: paymentData,
      },
    });

    // Update invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: 'paid',
        paidAmount: invoice.total,
        paymentDate: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

