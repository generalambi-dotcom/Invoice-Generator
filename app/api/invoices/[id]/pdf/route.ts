import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInvoicePDFBuffer } from '@/lib/pdf-server';
import { Invoice as PDFInvoice, CompanyInfo, ClientInfo, LineItem, ShipToInfo, Currency, Theme } from '@/types/invoice';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const invoiceId = params.id;

        if (!invoiceId) {
            return NextResponse.json(
                { error: 'Invoice ID is required' },
                { status: 400 }
            );
        }

        // Fetch invoice
        // Note: We're allowing public access via ID for WhatsApp convenience
        // This follows the pattern of the public invoice view
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Map Prisma invoice to PDF Invoice type
        // The types need to match what InvoicePDF expects
        const pdfInvoice: PDFInvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            purchaseOrder: invoice.purchaseOrder || undefined,
            company: invoice.companyInfo as unknown as CompanyInfo,
            client: invoice.clientInfo as unknown as ClientInfo,
            shipTo: invoice.shipToInfo ? (invoice.shipToInfo as unknown as ShipToInfo) : undefined,
            lineItems: invoice.lineItems as unknown as LineItem[],
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            taxAmount: invoice.taxAmount,
            discountRate: invoice.discountRate,
            discountAmount: invoice.discountAmount,
            shipping: invoice.shipping,
            total: invoice.total,
            currency: invoice.currency as Currency,
            theme: invoice.theme as Theme,
            notes: invoice.notes || undefined,
            bankDetails: invoice.bankDetails || undefined,
            terms: invoice.terms || undefined,
            createdAt: invoice.createdAt.toISOString(),
            updatedAt: invoice.updatedAt.toISOString(),
            paymentStatus: invoice.paymentStatus as any,
            paymentDate: invoice.paymentDate?.toISOString(),
            paymentLink: invoice.paymentLink || undefined,
            paymentProvider: invoice.paymentProvider as any,
            paidAmount: invoice.paidAmount || 0,
        };

        // Generate PDF buffer
        const pdfBuffer = await generateInvoicePDFBuffer(pdfInvoice);

        if (!pdfBuffer) {
            return NextResponse.json(
                { error: 'Failed to generate PDF' },
                { status: 500 }
            );
        }

        // Return PDF stream
        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Error generating invoice PDF:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
