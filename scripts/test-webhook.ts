
import 'dotenv/config'; // Load env vars first!
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const SENDER_NUMBER = 'whatsapp:+15550009999'; // A guaranteed unique test number
    const TEST_EMAIL = 'whatsapp_test_2@example.com';

    console.log('🔄 Setting up test data...');
    console.log(`ℹ️  Connecting to: ${process.env.DATABASE_URL?.split('@')[1]}`); // Log host for debugging (safe-ish)

    try {
        // 1. Create/Get User
        let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: TEST_EMAIL,
                    name: 'WhatsApp Tester',
                    password: 'hashed_placeholder',
                    emailVerified: true
                }
            });
            console.log('✅ Created test user:', user.id);
        } else {
            console.log('ℹ️ Found existing test user:', user.id);
        }

        // 2. Create/Get WhatsApp Credential
        const creds = await prisma.whatsAppCredential.upsert({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: 'twilio'
                }
            },
            update: {
                phoneNumber: SENDER_NUMBER,
                isVerified: true,
                isActive: true
            },
            create: {
                userId: user.id,
                provider: 'twilio',
                phoneNumber: SENDER_NUMBER,
                isVerified: true,
                isActive: true,
                credentials: 'encrypted_placeholder'
            }
        });
        console.log('✅ Linked WhatsApp number:', creds.phoneNumber);


        // 3. Send Webhook
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const ENDPOINT = `${APP_URL}/api/webhooks/whatsapp`;
        const messageBody = "Invoice Client One for $150 website design";

        const params = new URLSearchParams();
        params.append('SmsMessageSid', `SM${Date.now()}`);
        params.append('Body', messageBody);
        params.append('From', SENDER_NUMBER);
        params.append('To', 'whatsapp:+14155238886');
        params.append('AccountSid', 'AC_mock_account');

        console.log(`\n🚀 Sending Webhook to ${ENDPOINT}...`);

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'TwilioProxy/1.1'
            },
            body: params
        });

        const text = await response.text();
        console.log(`📡 Status: ${response.status}`);
        console.log(`📄 Response: ${text}`);

        if (response.ok) {
            console.log('\n✅ Webhook processed successfully!');

            // 4. Verify Invoice Creation
            // Give it a small delay for async processing
            await new Promise(r => setTimeout(r, 1000));

            const recentInvoice = await prisma.invoice.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            });

            if (recentInvoice && recentInvoice.total === 150) {
                console.log(`🎉 SUCCESS! Created Invoice #${recentInvoice.invoiceNumber} for ${recentInvoice.total}`);
            } else {
                console.log('Recent invoices:', recentInvoice);
                console.warn('⚠️ Webhook returned 200, but Invoice was not found or matched expected values.');
            }

        } else {
            console.error('❌ Webhook failed.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
