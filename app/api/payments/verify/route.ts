import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyPaymentReceived } from '@/lib/payment-notifications';
import { decryptPaymentCredential } from '@/lib/encryption';

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

    // Secret keys are stored encrypted at rest — decrypt before calling the provider.
    const secretKey = decryptPaymentCredential({ secretKey: credential.secretKey }).secretKey;

    // Verify payment with provider
    let paymentData: any;
    let paidMinorUnits = 0; // amount actually paid, in minor units (kobo/cents)
    let paidCurrency = '';

    if (provider === 'paystack') {
      // Verify with Paystack
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });
      const data = await response.json();

      if (data.status && data.data.status === 'success') {
        paymentData = data.data;
        paidMinorUnits = Number(paymentData.amount) || 0; // Paystack returns kobo
        paidCurrency = paymentData.currency || '';
      } else {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    } else if (provider === 'stripe') {
      // Verify with Stripe
      const Stripe = require('stripe');
      const stripe = new Stripe(secretKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(reference);

      if (paymentIntent.status === 'succeeded') {
        paymentData = paymentIntent;
        paidMinorUnits = Number(paymentIntent.amount_received ?? paymentIntent.amount) || 0; // cents
        paidCurrency = paymentIntent.currency || '';
      } else {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment provider' },
        { status: 400 }
      );
    }

    // Guard against underpayment: the amount actually captured must cover the
    // invoice total. Without this, a ₦100 charge could clear a ₦100,000 invoice.
    const expectedMinorUnits = Math.round(invoice.total * 100);
    if (paidMinorUnits + 1 < expectedMinorUnits) {
      return NextResponse.json(
        { error: 'Paid amount does not cover the invoice total' },
        { status: 400 }
      );
    }

    // Guard against currency substitution (e.g. paying the total in a weaker
    // currency). Only enforced when the invoice stores a 3-letter currency code.
    const invoiceCurrency = (invoice.currency || '').toUpperCase();
    if (paidCurrency && invoiceCurrency.length === 3 && paidCurrency.toUpperCase() !== invoiceCurrency) {
      return NextResponse.json(
        { error: 'Payment currency does not match the invoice currency' },
        { status: 400 }
      );
    }

    const paidAmount = paidMinorUnits / 100;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        userId: invoice.userId,
        amount: paidAmount,
        currency: invoice.currency,
        provider,
        transactionId: paymentData.id?.toString() || paymentData.reference,
        reference: reference,
        status: 'completed',
        paidAt: new Date(),
        providerData: paymentData,
      },
    });

    const wasAlreadyPaid = invoice.paymentStatus === 'paid';

    // Update invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: 'paid',
        paidAmount: paidAmount,
        paymentDate: new Date(),
      },
    });

    // Fire payment emails (owner notification + client receipt). EmailLog
    // dedupe inside the helper guards against the webhook firing the same one.
    if (!wasAlreadyPaid) {
      notifyPaymentReceived(invoiceId).catch(() => {});
    }

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

