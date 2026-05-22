import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { sendInvoiceReminderEmail, sendInvoiceEmail } from '@/lib/email';
import { generateInvoicePDFBuffer } from '@/lib/pdf-server';

// POST - Handle bulk actions on invoices
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, invoiceIds } = body;

        if (!action || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return NextResponse.json(
                { error: 'Action and at least one invoice ID are required' },
                { status: 400 }
            );
        }

        // Verify all invoices belong to the user
        const invoices = await prisma.invoice.findMany({
            where: {
                id: { in: invoiceIds },
                userId: user.userId,
            },
            include: { payments: true },
        });

        if (invoices.length === 0) {
            return NextResponse.json({ error: 'No valid invoices found' }, { status: 404 });
        }

        switch (action) {
            case 'send-reminders': {
                let sent = 0;
                let failed = 0;
                const errors: string[] = [];

                for (const invoice of invoices) {
                    if (invoice.paymentStatus === 'paid') continue;

                    const clientEmail = (invoice.clientInfo as any)?.email;
                    if (!clientEmail) {
                        failed++;
                        errors.push(`${invoice.invoiceNumber}: No client email`);
                        continue;
                    }

                    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
                    const daysOverdue = invoice.dueDate
                        ? Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;

                    try {
                        await sendInvoiceReminderEmail({
                            invoice,
                            type: isOverdue ? 'overdue' : 'due_soon',
                            days: Math.abs(daysOverdue),
                        });
                        sent++;
                    } catch (err: any) {
                        failed++;
                        errors.push(`${invoice.invoiceNumber}: ${err.message}`);
                    }
                }

                return NextResponse.json({
                    success: true,
                    action: 'send-reminders',
                    results: { sent, failed, errors, total: invoices.length },
                });
            }

            case 'mark-paid': {
                const now = new Date();
                const updated = await prisma.invoice.updateMany({
                    where: {
                        id: { in: invoiceIds },
                        userId: user.userId,
                        paymentStatus: { not: 'paid' },
                    },
                    data: {
                        paymentStatus: 'paid',
                        paymentDate: now,
                    },
                });

                return NextResponse.json({
                    success: true,
                    action: 'mark-paid',
                    results: { updated: updated.count, total: invoiceIds.length },
                });
            }

            case 'export-csv': {
                const headers = [
                    'Invoice Number',
                    'Client',
                    'Invoice Date',
                    'Due Date',
                    'Subtotal',
                    'Tax',
                    'Discount',
                    'Total',
                    'Paid Amount',
                    'Balance',
                    'Currency',
                    'Status',
                ];

                const rows = invoices.map((inv) => {
                    const clientName = (inv.clientInfo as any)?.name || '';
                    const paidAmount = inv.payments?.reduce((s: number, p: any) => s + (p.amount || 0), 0) || 0;
                    const balance = (inv.total || 0) - paidAmount;

                    return [
                        inv.invoiceNumber,
                        `"${clientName}"`,
                        inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '',
                        inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '',
                        inv.subtotal?.toFixed(2) || '0.00',
                        inv.taxAmount?.toFixed(2) || '0.00',
                        inv.discountAmount?.toFixed(2) || '0.00',
                        inv.total?.toFixed(2) || '0.00',
                        paidAmount.toFixed(2),
                        balance.toFixed(2),
                        inv.currency,
                        inv.paymentStatus || 'pending',
                    ].join(',');
                });

                const csv = [headers.join(','), ...rows].join('\n');

                return new NextResponse(csv, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename=invoices-export-${new Date().toISOString().split('T')[0]}.csv`,
                    },
                });
            }

            case 'send': {
                // Bulk send invoice emails — each to its own client email
                const fullInvoices = await prisma.invoice.findMany({
                    where: { id: { in: invoiceIds }, userId: user.userId },
                    include: { user: true },
                });

                let sent = 0;
                let failed = 0;
                const errors: string[] = [];

                for (const invoice of fullInvoices) {
                    const clientEmail = (invoice.clientInfo as any)?.email;
                    if (!clientEmail) {
                        failed++;
                        errors.push(`${invoice.invoiceNumber}: No client email`);
                        continue;
                    }

                    try {
                        // Generate PDF attachment
                        const pdfInvoice = {
                            id: invoice.id,
                            invoiceNumber: invoice.invoiceNumber,
                            invoiceDate: invoice.invoiceDate,
                            dueDate: invoice.dueDate,
                            purchaseOrder: invoice.purchaseOrder,
                            company: invoice.companyInfo,
                            client: invoice.clientInfo,
                            lineItems: invoice.lineItems,
                            subtotal: invoice.subtotal,
                            taxRate: invoice.taxRate,
                            taxAmount: invoice.taxAmount,
                            discountRate: invoice.discountRate,
                            discountAmount: invoice.discountAmount,
                            shipping: invoice.shipping,
                            total: invoice.total,
                            currency: invoice.currency,
                            theme: invoice.theme,
                            notes: invoice.notes,
                            bankDetails: invoice.bankDetails,
                            terms: invoice.terms,
                        };
                        const pdfBuffer = await generateInvoicePDFBuffer(pdfInvoice).catch(() => null);

                        const result = await sendInvoiceEmail({
                            invoice,
                            to: clientEmail,
                            message: '',
                            pdfBuffer: pdfBuffer || undefined,
                        });

                        if (result.success) {
                            await prisma.invoice.update({
                                where: { id: invoice.id },
                                data: { sentAt: new Date() },
                            });
                            sent++;
                        } else {
                            failed++;
                            errors.push(`${invoice.invoiceNumber}: ${result.error}`);
                        }
                    } catch (err: any) {
                        failed++;
                        errors.push(`${invoice.invoiceNumber}: ${err.message}`);
                    }
                }

                return NextResponse.json({
                    success: true,
                    action: 'send',
                    results: { sent, failed, errors, total: fullInvoices.length },
                });
            }

            case 'delete': {
                // Soft-delete: mark as cancelled
                const updated = await prisma.invoice.updateMany({
                    where: {
                        id: { in: invoiceIds },
                        userId: user.userId,
                        paymentStatus: { not: 'cancelled' },
                    },
                    data: { paymentStatus: 'cancelled' },
                });

                return NextResponse.json({
                    success: true,
                    action: 'delete',
                    results: { updated: updated.count, total: invoiceIds.length },
                });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error processing bulk action:', error);
        return NextResponse.json({ error: 'Failed to process bulk action' }, { status: 500 });
    }
}
