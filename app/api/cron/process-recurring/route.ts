import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getNextInvoiceNumber, incrementInvoiceNumber } from '@/lib/invoice-number';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

function parseTermsToDays(terms?: string): number {
    if (!terms) return 7; // Default
    const t = terms.toLowerCase();
    if (t.includes('due on receipt') || t.includes('immediately')) return 0;
    if (t.includes('net 7') || t.includes('7 days')) return 7;
    if (t.includes('net 10') || t.includes('10 days')) return 10;
    if (t.includes('net 14') || t.includes('14 days') || t.includes('2 weeks')) return 14;
    if (t.includes('net 15') || t.includes('15 days')) return 15;
    if (t.includes('net 30') || t.includes('30 days') || t.includes('1 month')) return 30;
    if (t.includes('net 45') || t.includes('45 days')) return 45;
    if (t.includes('net 60') || t.includes('60 days') || t.includes('2 months')) return 60;
    if (t.includes('net 90') || t.includes('90 days') || t.includes('3 months')) return 90;
    
    // Extract any obvious number
    const match = terms.match(/(?:due in\s+|net\s+)?(\d+)\s*(?:days?)?/i);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    
    return 7; // Fallback
}

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

                // Parse due date correctly from the terms string
                const daysToAdd = parseTermsToDays(invoiceData.terms);
                let dueDate = addDays(newInvoiceDate, daysToAdd);

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
