import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/[id]/refund
 *
 * Marks a payment as refunded, reduces the invoice paidAmount, and recalculates
 * the invoice paymentStatus. For Stripe payments, optionally triggers a Stripe
 * refund via the API.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { invoice: true },
    });

    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (payment.status === 'refunded') {
      return NextResponse.json({ error: 'Payment has already been refunded' }, { status: 400 });
    }

    // ── Optional: trigger Stripe refund ──────────────────────────────────────
    let stripeRefundId: string | undefined;
    if (payment.provider === 'stripe' && payment.transactionId) {
      try {
        let stripeSecretKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeSecretKey) {
          const adminUser = await prisma.user.findFirst({
            where: { isAdmin: true },
            orderBy: { createdAt: 'asc' },
          });
          if (adminUser) {
            const cred = await prisma.paymentCredential.findUnique({
              where: { userId_provider: { userId: adminUser.id, provider: 'stripe' } },
            });
            if (cred?.secretKey && cred.isActive) {
              const { decryptPaymentCredential } = require('@/lib/encryption');
              const dec = decryptPaymentCredential({ secretKey: cred.secretKey });
              stripeSecretKey = dec.secretKey || undefined;
            }
          }
        }

        if (stripeSecretKey) {
          const Stripe = require('stripe');
          const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-12-15.clover' });
          const stripeRefund = await stripe.refunds.create({
            payment_intent: payment.transactionId,
          });
          stripeRefundId = stripeRefund.id;
          console.log(`✅ Stripe refund created: ${stripeRefundId}`);
        }
      } catch (stripeErr: any) {
        // Log but don't block — mark as refunded locally even if Stripe fails
        console.error('Stripe refund failed (marking locally):', stripeErr.message);
      }
    }

    // ── Mark payment as refunded ──────────────────────────────────────────────
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
        providerData: {
          ...(typeof payment.providerData === 'object' && payment.providerData !== null
            ? (payment.providerData as object)
            : {}),
          refundedAt: new Date().toISOString(),
          stripeRefundId: stripeRefundId ?? null,
        },
      },
    });

    // ── Recalculate invoice paidAmount & status ───────────────────────────────
    const remainingPayments = await prisma.payment.findMany({
      where: { invoiceId: payment.invoiceId, status: { not: 'refunded' } },
    });

    const newPaidAmount = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceTotal = payment.invoice.total;

    let newStatus: string;
    if (newPaidAmount >= invoiceTotal && invoiceTotal > 0) {
      newStatus = 'paid';
    } else if (new Date() > new Date(payment.invoice.dueDate)) {
      newStatus = 'overdue';
    } else {
      newStatus = 'pending';
    }

    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        paidAmount: Math.max(0, newPaidAmount),
        paymentStatus: newStatus,
        paymentDate: newPaidAmount >= invoiceTotal ? payment.invoice.paymentDate : null,
      },
    });

    console.log(`✅ Payment ${payment.id} refunded for user ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment refunded successfully',
      stripeRefundId: stripeRefundId ?? null,
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
