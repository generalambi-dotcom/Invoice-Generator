import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getNextInvoiceNumber, incrementInvoiceNumber } from '@/lib/invoice-number';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Basic security check (can be enhanced with a secret header)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        // Reset time to start of day needed? 
        // Usually standardizing on UTC or just comparing dates is safer. 
        // strictly speaking: find active profiles where nextRunDate <= now

        const activeRecurrings = await prisma.recurringInvoice.findMany({
            where: {
                status: 'active',
                nextRunDate: {
                    lte: today,
                },
            },
        });

        console.log(`[Cron] Found ${activeRecurrings.length} recurring invoices to process.`);

        const results = [];

        for (const recurring of activeRecurrings) {
            try {
                console.log(`[Cron] Processing recurring invoice ${recurring.id} for user ${recurring.userId}`);

                // 1. Generate new invoice number
                // We need to know the user's sequence format.
                // If not found, use default.
                // The getNextInvoiceNumber utility handles this lookup.
                const { invoiceNumber, sequence } = await getNextInvoiceNumber(recurring.userId);

                // 2. Create the Invoice
                const invoiceData = recurring.invoiceData as any; // Cast to access properties
                const newInvoiceDate = new Date();

                // Calculate due date based on terms or existing logic (e.g. 7 days from now)
                // If terms are "Net 30", dd = date + 30.
                // For simplicity, let's default to 7 days if not parsed from terms efficiently here,
                // or re-use the gap between original invoiceDate and dueDate if available in template?
                // Let's assume Net 7 for now or try to parse 'terms'.
                let dueDate = addDays(newInvoiceDate, 7);
                // TODO: Smart term parsing

                const newInvoice = await prisma.invoice.create({
                    data: {
                        userId: recurring.userId,
                        invoiceNumber,
                        invoiceDate: newInvoiceDate,
                        dueDate: dueDate,
                        companyInfo: invoiceData.companyInfo,
                        clientInfo: invoiceData.clientInfo,
                        lineItems: invoiceData.lineItems, // Ensure this structure matches
                        subtotal: invoiceData.subtotal,
                        taxRate: invoiceData.taxRate,
                        taxAmount: invoiceData.taxAmount,
                        discountRate: invoiceData.discountRate,
                        discountAmount: invoiceData.discountAmount,
                        shipping: invoiceData.shipping,
                        total: invoiceData.total,
                        currency: invoiceData.currency || 'USD',
                        theme: invoiceData.theme || 'slate',
                        notes: invoiceData.notes,
                        terms: invoiceData.terms,
                        paymentStatus: 'pending',
                        createdBy: 'system (recurring)',
                        // Link back to recurring profile could be useful if schema supported it, 
                        // but for now we just create it.
                    },
                });

                // 3. Mark sequence as used
                await incrementInvoiceNumber(sequence.id);

                // 4. Update Recurring Profile
                // Calculate *next* run date
                let nextRun = new Date(recurring.nextRunDate);
                // We must increment until it's in the future relative to LAST scheduled run, 
                // to avoid drift? Or just simple add based on frequency.
                // Using simply "add frequency to current nextRunDate" keeps the schedule clean (e.g. always 1st of month)

                const interval = recurring.interval || 1;
                switch (recurring.frequency) {
                    case 'daily':
                        nextRun = addDays(nextRun, interval);
                        break;
                    case 'weekly':
                        nextRun = addWeeks(nextRun, interval);
                        break;
                    case 'monthly':
                        nextRun = addMonths(nextRun, interval);
                        break;
                    case 'yearly':
                        nextRun = addYears(nextRun, interval);
                        break;
                }

                // Check if we hit end date
                let newStatus = 'active';
                if (recurring.endDate && nextRun > recurring.endDate) {
                    newStatus = 'completed';
                }

                // Check max invoices
                const newInvoicesCreated = recurring.invoicesCreated + 1;
                if (recurring.maxInvoices && newInvoicesCreated >= recurring.maxInvoices) {
                    newStatus = 'completed';
                }

                await prisma.recurringInvoice.update({
                    where: { id: recurring.id },
                    data: {
                        lastRunDate: new Date(),
                        nextRunDate: nextRun,
                        invoicesCreated: newInvoicesCreated,
                        status: newStatus,
                    },
                });

                results.push({
                    recurringId: recurring.id,
                    invoiceId: newInvoice.id,
                    invoiceNumber: newInvoice.invoiceNumber,
                    status: 'success',
                });

            } catch (err: any) {
                console.error(`[Cron] Error processing recurring ${recurring.id}:`, err);
                results.push({
                    recurringId: recurring.id,
                    error: err.message,
                    status: 'failed',
                });
            }
        }

        return NextResponse.json({
            processed: results.length,
            results,
        });
    } catch (error) {
        console.error('[Cron] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
