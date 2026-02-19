import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInvoiceEmail } from '@/lib/email';
import { generateInvoicePDFBuffer } from '@/lib/pdf-server';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting for public endpoint
        const identifier = getClientIdentifier(request);
        const limiter = rateLimit(rateLimitConfigs.email);
        const limitResult = limiter(identifier);

        if (!limitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { invoiceId, email, subscribeToBrevo } = body;

        if (!invoiceId || !email) {
            return NextResponse.json(
                { error: 'Invoice ID and email are required' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Get invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Generate PDF for attachment (server-side)
        let pdfBuffer: Buffer | undefined;
        try {
            const pdfInvoice = {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,
                purchaseOrder: invoice.purchaseOrder,
                company: invoice.companyInfo,
                client: invoice.clientInfo,
                shipTo: invoice.shipToInfo,
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

            const generatedPdf = await generateInvoicePDFBuffer(pdfInvoice);
            pdfBuffer = generatedPdf || undefined;
        } catch (pdfError: any) {
            console.error('Error generating PDF for email:', pdfError);
        }

        // Send email with PDF attachment
        const emailResult = await sendInvoiceEmail({
            invoice,
            to: email,
            message: 'Here is a copy of the invoice you recently created or downloaded.',
            pdfBuffer,
        });

        if (!emailResult.success) {
            return NextResponse.json(
                { error: emailResult.error || 'Failed to send email' },
                { status: 500 }
            );
        }

        // Handle Brevo subscription if requested
        if (subscribeToBrevo) {
            try {
                // Internal fetch to our subscribe endpoint
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
                await fetch(`${baseUrl}/api/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name: (invoice.clientInfo as any)?.name || 'Guest' }),
                });
            } catch (brevoError) {
                console.error('Failed to subscribe user to Brevo during guest copy send:', brevoError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice copy sent successfully'
        });
    } catch (error: any) {
        console.error('Error in send-copy:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
