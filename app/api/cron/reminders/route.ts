import { NextRequest, NextResponse } from 'next/server';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { prisma } from '@/lib/db';
import { checkCronAuth } from '@/lib/cron-auth';
import { sendPaymentReminder, type ReminderType } from '@/lib/reminder-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  try {
    const invoices = await prisma.invoice.findMany({
      where: { paymentStatus: { in: ['pending', 'overdue'] } },
      include: { user: { include: { invoiceReminderSettings: true } } },
    });

    const results = { examined: invoices.length, due: 0, sent: 0, skipped: 0, errors: 0 };
    const today = startOfDay(new Date());

    for (const invoice of invoices) {
      const settings = invoice.user.invoiceReminderSettings;
      if (!settings?.enableEmail) continue;

      const days = differenceInCalendarDays(today, startOfDay(new Date(invoice.dueDate)));
      let type: ReminderType | null = null;
      let reminderDays = 0;

      if (settings.remindBeforeDue !== null && days === -settings.remindBeforeDue) {
        type = 'due_soon';
        reminderDays = settings.remindBeforeDue;
      } else if (settings.remindOnDue && days === 0) {
        type = 'due_today';
      } else if (settings.remindAfterDue1 !== null && days === settings.remindAfterDue1) {
        type = 'overdue';
        reminderDays = settings.remindAfterDue1;
      } else if (settings.remindAfterDue2 !== null && days === settings.remindAfterDue2) {
        type = 'overdue';
        reminderDays = settings.remindAfterDue2;
      }

      if (!type) continue;
      results.due++;

      const sent = await sendPaymentReminder({
        invoiceId: invoice.id,
        type,
        days: reminderDays,
        automated: true,
      });

      if (sent.success && 'skipped' in sent && sent.skipped) results.skipped++;
      else if (sent.success) results.sent++;
      else {
        results.errors++;
        console.error(`Reminder failed for invoice ${invoice.id}:`, sent.error);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Reminder cron failed:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
