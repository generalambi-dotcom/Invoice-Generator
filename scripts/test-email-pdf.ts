
import 'dotenv/config';
import { generateInvoicePDFBuffer } from '../lib/pdf-server';
import { sendInvoiceEmail } from '../lib/email';

async function main() {
    console.log('📧 Testing Email with PDF Attachment...');

    const mockInvoice = {
        id: 'mock_invoice_123',
        invoiceNumber: 'INV-TEST-EMAIL-001',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 86400000),
        currency: 'USD',
        total: 150.00,
        subtotal: 100.00,
        taxAmount: 10.00,
        taxRate: 10,
        discountAmount: 0,
        shipping: 40,
        company: {
            name: 'Test Company',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip: '12345',
            country: 'USA',
            email: 'company@test.com'
        },
        client: {
            name: 'Test Client',
            address: '456 Client Rd',
            city: 'Client City',
            state: 'CL',
            zip: '67890',
            country: 'USA',
            email: 'client@test.com'
        },
        lineItems: [
            { description: 'Test Service', quantity: 1, rate: 100, amount: 100 }
        ]
    };

    console.log('📄 Generating PDF Buffer...');
    const pdfBuffer = await generateInvoicePDFBuffer(mockInvoice);

    if (!pdfBuffer) {
        console.error('❌ Failed to generate PDF Buffer');
        return;
    }
    console.log(`✅ PDF Data Generated (${pdfBuffer.length} bytes)`);

    console.log('📤 Sending Email...');
    // Use a safe email or the developer's email if possible, or just log success if blocked
    // Resend requires verified domain or allows sending to the account owner email in test mode.
    // We will assume the user has access to check variables usually. 
    // BUT we will use a clearly dummy email that Resend MIGHT block if not verified, 
    // however, the script is to test *code execution path*.

    const recipient = 'delivered@resend.dev'; // Resend test email that always works for testing success

    const result = await sendInvoiceEmail({
        invoice: mockInvoice,
        to: recipient,
        message: 'This is a test invoice from the verification script.',
        pdfBuffer: pdfBuffer
    });

    if (result.success) {
        console.log(`✅ Email Sent Successfully to ${recipient}! ID: ${result.emailId}`);
    } else {
        console.log('❌ Email Send Failed:', result.error);
    }
}

main().catch(console.error);
