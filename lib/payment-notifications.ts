/**
 * Payment notification helper.
 *
 * Single source of truth for firing payment emails when an invoice is paid.
 * Wired into every "mark paid" path: manual payment recording, invoice PATCH,
 * bulk mark-paid, and the Stripe/Paystack webhooks.
 *
 * - Notifies the business OWNER for any recorded payment (full or partial).
 * - Sends a CLIENT confirmation/receipt only once the invoice is fully settled.
 * - De-duplicates via EmailLog so webhook retries / repeated calls don't double-send.
 *
 * Always call this AFTER the invoice row has been updated in the DB.
 * Safe to fire-and-forget — never throws.
 */
import { prisma } from '@/lib/db';
import { sendPaymentReceivedEmail, sendPaymentConfirmationEmail } from '@/lib/email';

const fmt = (n: number) => (n ?? 0).toFixed(2);

export async function notifyPaymentReceived(
  invoiceId: string,
  opts?: { paymentAmount?: number }
): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!invoice || !invoice.user) return;

    const total = invoice.total ?? 0;
    const paidAmount = invoice.paidAmount ?? 0;
    const currency = invoice.currency || 'USD';
    const clientInfo = (invoice.clientInfo as any) || {};
    const companyInfo = (invoice.companyInfo as any) || {};
    const clientName = clientInfo.name || 'Customer';
    const clientEmail: string | undefined = clientInfo.email;
    const companyName = companyInfo.name || invoice.user.name || 'InvoiceGenerator.ng';

    const isFullyPaid = invoice.paymentStatus === 'paid' || paidAmount >= total;
    // The amount of *this* payment. Provided explicitly by the manual-payment
    // route; otherwise assume the invoice was settled in full.
    const effectivePayment = opts?.paymentAmount ?? (isFullyPaid ? total : paidAmount);
    const displayBalance = isFullyPaid ? 0 : Math.max(0, total - paidAmount);

    // ── Owner notification (dedupe per invoice + payment amount) ──────────────
    const ownerKey = `payment_received:${invoiceId}:${fmt(effectivePayment)}`;
    const ownerExisting = await prisma.emailLog.findFirst({
      where: { userId: invoice.userId, subject: ownerKey },
    });
    if (!ownerExisting && invoice.user.email) {
      const res = await sendPaymentReceivedEmail({
        to: invoice.user.email,
        userName: invoice.user.name || 'there',
        clientName,
        invoiceNumber: invoice.invoiceNumber,
        paymentAmount: fmt(effectivePayment),
        invoiceTotal: fmt(total),
        remainingBalance: fmt(displayBalance),
        currency,
      });
      if (res.success) {
        await prisma.emailLog.create({
          data: {
            userId: invoice.userId,
            invoiceId,
            to: invoice.user.email,
            subject: ownerKey,
            body: 'Payment received notification (owner)',
            status: 'sent',
          },
        });
      }
    }

    // ── Client confirmation (only once fully paid; dedupe per invoice) ────────
    if (isFullyPaid && clientEmail) {
      const clientKey = `payment_confirmation:${invoiceId}`;
      const clientExisting = await prisma.emailLog.findFirst({
        where: { userId: invoice.userId, subject: clientKey },
      });
      if (!clientExisting) {
        const res = await sendPaymentConfirmationEmail({
          to: clientEmail,
          clientName,
          companyName,
          invoiceNumber: invoice.invoiceNumber,
          paymentAmount: fmt(effectivePayment),
          invoiceTotal: fmt(total),
          remainingBalance: fmt(displayBalance),
          currency,
        });
        if (res.success) {
          await prisma.emailLog.create({
            data: {
              userId: invoice.userId,
              invoiceId,
              to: clientEmail,
              subject: clientKey,
              body: 'Payment confirmation (client)',
              status: 'sent',
            },
          });
        }
      }
    }
  } catch (err) {
    console.error('notifyPaymentReceived error:', err);
  }
}
