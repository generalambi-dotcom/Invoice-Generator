
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { sendInvoiceViaWhatsApp } from '../lib/whatsapp-sender';
import { autoGeneratePaymentLink } from '../lib/auto-payment-link';

// Mock specific modules to prevent real API calls
const originalFetch = global.fetch;

// Mock the global fetch to intercept Twilio/Meta calls
global.fetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlString = url.toString();

    // Intercept Twilio/Meta API calls
    if (urlString.includes('api.twilio.com') || urlString.includes('graph.facebook.com')) {
        console.log('Intercepted Message Send:');

        let bodyArg = init?.body;
        let bodyStr = '';

        if (bodyArg) {
            if (typeof bodyArg === 'string') {
                bodyStr = bodyArg;
            } else if (bodyArg instanceof URLSearchParams) {
                bodyStr = bodyArg.toString();
            }
        }

        // Print the message body for verification
        if (bodyStr.includes('Body=')) {
            // Twilio format
            const params = new URLSearchParams(bodyStr);
            console.log('---- MESSAGE BODY (Twilio) ----');
            console.log(params.get('Body'));
        } else {
            // Meta JSON format
            try {
                const json = JSON.parse(bodyStr);
                console.log('---- MESSAGE BODY (Meta) ----');
                console.log(json.text?.body);
            } catch (e) {
                console.log('Raw Body:', bodyStr);
            }
        }
        console.log('-------------------------------');

        return new Response(JSON.stringify({ sid: 'mock_sid', messages: [{ id: 'mock_id' }] }), { status: 200 });
    }

    // Pass through other calls (like localhost API calls if any)
    return originalFetch(url, init);
};

const prisma = new PrismaClient();

async function main() {
    const TEST_EMAIL = 'whatsapp_quickpay_test@example.com';
    console.log('🔄 Setting up WhatsApp Quick-Pay test...');

    try {
        // 1. Create/Get User
        let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: TEST_EMAIL,
                    name: 'Quick Pay Tester',
                    password: 'hashed_placeholder',
                    emailVerified: true
                }
            });
        }

        // 2. Add Dummy Payment Credential to ensure link generation works
        await prisma.paymentCredential.upsert({
            where: { userId_provider: { userId: user.id, provider: 'stripe' } },
            update: { isActive: true },
            create: {
                userId: user.id,
                provider: 'stripe',
                publicKey: 'pk_test_mock',
                secretKey: 'sk_test_mock_encrypted',
                isActive: true
            }
        });

        // 3. Enable WhatsApp Settings (Mock)
        await prisma.whatsAppSettings.upsert({
            where: { provider: 'twilio' },
            update: { isEnabled: true, twilioAccountSid: 'mock_sid', twilioAuthToken: 'mock_token:iv' },
            create: { provider: 'twilio', isEnabled: true, twilioAccountSid: 'mock_sid', twilioAuthToken: 'mock_token:iv' }
        });

        // 4. Create Invoice (Without Payment Link initially)
        const invoice = await prisma.invoice.create({
            data: {
                userId: user.id,
                invoiceNumber: `WA-TEST-${Date.now()}`,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 86400000),
                companyInfo: { name: 'Quick Pay Co' },
                clientInfo: { name: 'WhatsApp Client' },
                lineItems: [
                    { description: 'Consulting', quantity: 2, rate: 150, amount: 300 },
                    { description: 'Hosting', quantity: 1, rate: 50, amount: 50 }
                ],
                subtotal: 350,
                total: 350,
                currency: 'USD',
                paymentStatus: 'pending'
            }
        });
        console.log('✅ Created Invoice:', invoice.id);

        // 5. Trigger Sending
        console.log('🔄 Triggering WhatsApp Send (should auto-generate link)...');

        // We expect this function to call our intercepted fetch
        await sendInvoiceViaWhatsApp(user.id, invoice.id, '+15550001234');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
