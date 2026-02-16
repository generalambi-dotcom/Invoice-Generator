import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInvoiceReminderEmail } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 60; // Allow 60 seconds for execution (Vercel limit)

export async function GET(req: NextRequest) {
    // 1. Authentication (Simple Bearer token for Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Fetch all settings enabled users
        const settingsList = await prisma.invoiceReminderSettings.findMany({
            where: {
                enableEmail: true, // Only processing email for now
            },
            include: {
                user: true,
            },
        });

        const results = {
            processed: 0,
            sent: 0,
            errors: 0,
        };

        // 3. Process each user's reminders
        for (const settings of settingsList) {
            const { userId, remindBeforeDue, remindOnDue, remindAfterDue1, remindAfterDue2 } = settings;

            // Calculate target dates
            const datesToCheck: { date: Date; type: 'due_soon' | 'due_today' | 'overdue'; days: number }[] = [];

            // Due Soon
            if (remindBeforeDue && remindBeforeDue > 0) {
                const target = new Date(today);
                target.setDate(today.getDate() + remindBeforeDue);
                datesToCheck.push({ date: target, type: 'due_soon', days: remindBeforeDue });
            }

            // Due Today
            if (remindOnDue) {
                datesToCheck.push({ date: today, type: 'due_today', days: 0 });
            }

            // Overdue 1
            if (remindAfterDue1 && remindAfterDue1 > 0) {
                const target = new Date(today);
                target.setDate(today.getDate() - remindAfterDue1);
                datesToCheck.push({ date: target, type: 'overdue', days: remindAfterDue1 });
            }

            // Overdue 2
            if (remindAfterDue2 && remindAfterDue2 > 0) {
                const target = new Date(today);
                target.setDate(today.getDate() - remindAfterDue2);
                datesToCheck.push({ date: target, type: 'overdue', days: remindAfterDue2 });
            }

            if (datesToCheck.length === 0) continue;

            // Find invoices matching these dates for this user
            // We do this in a loop or a complex OR query. Loop is safer for logic clarity.
            for (const check of datesToCheck) {
                // Find unpaid invoices with this specific due date
                // Note: Prisma date comparison needs care with timezones. 
                // We assume invoices store dueDate as DateTime at 00:00:00 UTC or similar.
                // For robustness, we search range [date 00:00, date 23:59]

                const startOfDay = new Date(check.date);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(check.date);
                endOfDay.setHours(23, 59, 59, 999);

                const invoices = await prisma.invoice.findMany({
                    where: {
                        userId: userId,
                        paymentStatus: { not: 'paid' },
                        dueDate: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                });

                for (const invoice of invoices) {
                    results.processed++;

                    // Basic validation checking if client has email
                    const clientInfo = invoice.clientInfo as any;
                    if (clientInfo && clientInfo.email) {

                        // Send Email
                        const sent = await sendInvoiceReminderEmail({
                            invoice: { ...invoice, clientInfo },
                            type: check.type,
                            days: check.days
                        });

                        if (sent.success) {
                            results.sent++;
                            // Log success (optional: add SystemLog here)
                        } else {
                            results.errors++;
                            console.error(`Failed to send reminder for Invoice ${invoice.id}:`, sent.error);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, ...results });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
