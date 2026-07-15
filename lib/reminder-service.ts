import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { sendInvoiceReminderEmail } from '@/lib/email';

export type ReminderType = 'due_soon' | 'due_today' | 'overdue';

interface SendReminderOptions {
  invoiceId: string;
  userId?: string;
  type: ReminderType;
  days?: number;
  automated?: boolean;
}

export async function sendPaymentReminder({
  invoiceId,
  userId,
  type,
  days = 0,
  automated = false,
}: SendReminderOptions) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, ...(userId ? { userId } : {}) },
  });

  if (!invoice) return { success: false, error: 'Invoice not found' };
  if (invoice.paymentStatus === 'paid') return { success: false, error: 'Invoice is already paid' };

  const client = invoice.clientInfo as { email?: string; name?: string } | null;
  if (!client?.email) return { success: false, error: 'Client email not found' };

  const dueDate = new Date(invoice.dueDate).toISOString().slice(0, 10);
  const trigger = type === 'due_soon'
    ? `before_due_${days}`
    : type === 'due_today'
      ? 'on_due'
      : `after_due_${days}`;
  const dedupeKey = automated ? `invoice-reminder:${invoice.id}:${dueDate}:${trigger}` : null;

  let logId: string | undefined;
  if (dedupeKey) {
    const existing = await prisma.emailLog.findUnique({ where: { dedupeKey } });
    if (existing?.status === 'sent' || existing?.status === 'sending') {
      return { success: true, skipped: true, emailId: existing.providerMessageId || undefined };
    }

    if (existing) {
      logId = existing.id;
      await prisma.emailLog.update({
        where: { id: existing.id },
        data: { status: 'sending', errorMessage: null },
      });
    } else {
      try {
        const created = await prisma.emailLog.create({
          data: {
            userId: invoice.userId,
            invoiceId: invoice.id,
            to: client.email,
            subject: `Payment reminder for invoice ${invoice.invoiceNumber}`,
            body: '',
            status: 'sending',
            dedupeKey,
            templateKey: `invoice_reminder_${trigger}`,
            metadata: { automated: true, trigger, days, dueDate },
          },
        });
        logId = created.id;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return { success: true, skipped: true };
        }
        throw error;
      }
    }
  }

  const result = await sendInvoiceReminderEmail({ invoice: { ...invoice, clientInfo: client }, type, days });

  if (!logId) {
    const created = await prisma.emailLog.create({
      data: {
        userId: invoice.userId,
        invoiceId: invoice.id,
        to: client.email,
        subject: `Payment reminder for invoice ${invoice.invoiceNumber}`,
        body: '',
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.error || null,
        providerMessageId: result.emailId === 'dev-mode' ? null : result.emailId,
        templateKey: `invoice_reminder_${trigger}`,
        metadata: { automated: false, trigger, days, dueDate },
      },
    });
    logId = created.id;
  } else {
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.error || null,
        providerMessageId: result.emailId === 'dev-mode' ? null : result.emailId,
      },
    });
  }

  if (!result.success) return result;

  const remindersSent = (invoice.remindersSent as Record<string, string> | null) || {};
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      remindersSent: { ...remindersSent, [trigger]: new Date().toISOString() },
      ...(type === 'overdue' && invoice.paymentStatus === 'pending' ? { paymentStatus: 'overdue' } : {}),
    },
  });

  return { ...result, skipped: false };
}
