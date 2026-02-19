import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInvoiceReminderEmail } from '@/lib/email';
import { isAfter, isBefore, startOfDay, addDays, subDays, differenceInCalendarDays } from 'date-fns';

// Max duration for the chron job
export const maxDuration = 300; // 5 minutes max on Vercel Pro

export async function GET(request: Request) {
    try {
        // 1. Validate Cron Secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Allow if no secret is set in env (for local testing), otherwise enforce it
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch pending/overdue invoices that have a due date
        const invoices = await prisma.invoice.findMany({
            where: {
                paymentStatus: { in: ['pending', 'overdue'] },
            },
            include: {
                user: {
                    include: {
                        invoiceReminderSettings: true,
                    }
                }
            }
        });

        const results = {
            totalFound: invoices.length,
            processed: 0,
            sent: 0,
            errors: 0,
        };

        const today = startOfDay(new Date());

        // 3. Process each invoice
        for (const invoice of invoices) {
            results.processed++;
            const settings = invoice.user?.invoiceReminderSettings;

            // Skip if user has no settings or has disabled email reminders
            if (!settings || !settings.enableEmail) continue;

            const dueDate = startOfDay(new Date(invoice.dueDate));
            const daysDiff = differenceInCalendarDays(today, dueDate); // Positive means past due, negative means future

            const remindersSent = ((invoice as any).remindersSent as Record<string, string>) || {};
            let triggerToFire: string | null = null;

            // Check "Before Due"
            if (
                settings.remindBeforeDue !== null &&
                daysDiff === -settings.remindBeforeDue &&
                !remindersSent[`before_due_${settings.remindBeforeDue}`]
            ) {
                triggerToFire = `before_due_${settings.remindBeforeDue}`;
            }
            // Check "On Due"
            else if (
                settings.remindOnDue &&
                daysDiff === 0 &&
                !remindersSent['on_due']
            ) {
                triggerToFire = 'on_due';
            }
            // Check "After Due 1"
            else if (
                settings.remindAfterDue1 !== null &&
                daysDiff === settings.remindAfterDue1 &&
                !remindersSent[`after_due_${settings.remindAfterDue1}`]
            ) {
                triggerToFire = `after_due_${settings.remindAfterDue1}`;
            }
            // Check "After Due 2"
            else if (
                settings.remindAfterDue2 !== null &&
                daysDiff === settings.remindAfterDue2 &&
                !remindersSent[`after_due_${settings.remindAfterDue2}`]
            ) {
                triggerToFire = `after_due_${settings.remindAfterDue2}`;
            }

            // 4. Fire the trigger
            if (triggerToFire) {
                try {
                    const clientInfo = invoice.clientInfo as any;
                    if (!clientInfo?.email) {
                        continue; // Skip if no client email
                    }

                    // Generate an optional custom message based on the trigger
                    let message = 'This is a gentle reminder regarding your invoice.';
                    if (triggerToFire.startsWith('before')) {
                        message = `This is a reminder that Invoice ${invoice.invoiceNumber} will be due soon.`;
                    } else if (triggerToFire === 'on_due') {
                        message = `This is a reminder that Invoice ${invoice.invoiceNumber} is due today.`;
                    } else if (triggerToFire.startsWith('after')) {
                        message = `This is a reminder that Invoice ${invoice.invoiceNumber} is currently overdue.`;
                    }

                    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}`;

                    await sendInvoiceReminderEmail({
                        to: clientInfo.email as string,
                        clientName: clientInfo.name,
                        invoiceNumber: invoice.invoiceNumber,
                        invoiceAmount: invoice.total.toLocaleString('en-US'),
                        invoiceCurrency: invoice.currency,
                        dueDate: new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                        message: message,
                        companyName: invoice.user?.name || 'Your Provider',
                        paymentUrl: invoice.paymentLink || publicUrl,
                        invoicePdfUrl: publicUrl
                    } as any); // Cast as any to bypass SendInvoiceReminderParams missing 'clientName' etc for now.

                    // 5. Update the invoice to record that this reminder was sent
                    const updatedRemindersSent = {
                        ...remindersSent,
                        [triggerToFire]: new Date().toISOString()
                    };

                    await (prisma.invoice as any).update({
                        where: { id: invoice.id },
                        data: {
                            remindersSent: updatedRemindersSent as any,
                            // Automatically mark as overdue if we are past due
                            ...(daysDiff > 0 && invoice.paymentStatus === 'pending' ? { paymentStatus: 'overdue' } : {})
                        }
                    });

                    results.sent++;
                } catch (error) {
                    console.error(`Error sending reminder for invoice ${invoice.id}:`, error);
                    results.errors++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Chron job error:', error);
        return NextResponse.json(
            { error: 'Failed to process reminders' },
            { status: 500 }
        );
    }
}
