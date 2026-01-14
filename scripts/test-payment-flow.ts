
import 'dotenv/config'; // Load env vars
import { PrismaClient } from '@prisma/client';
import { autoGeneratePaymentLink } from '../lib/auto-payment-link';

const prisma = new PrismaClient();

async function main() {
    const TEST_EMAIL = 'payment_test_user@example.com';
    console.log('🔄 Setting up payment test data...');

    try {
        // 1. Create/Get User
        let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: TEST_EMAIL,
                    name: 'Payment Tester',
                    password: 'hashed_placeholder',
                    emailVerified: true
                }
            });
            console.log('✅ Created test user:', user.id);
        } else {
            console.log('ℹ️ Found existing test user:', user.id);
        }

        // 2. Add Dummy Payment Credential (Stripe)
        // We are encrypting "mock_key" - normally use encryption helper, but for test logic checking, basic string is fine 
        // IF the decryption fails it might block, so let's import the encryption helper if possible or assume mock context.
        // However, since we are calling `autoGeneratePaymentLink` which calls `decryptPaymentCredential`, we need real encrypted data OR mock the implementation.
        // The `decryptPaymentCredential` helper likely uses `crypto`. Let's assume we can just store a basic string and if decryption fails it throws, 
        // so we should probably try to import the encryption helper to encrypt it first.

        // Let's rely on the fact that if we just want to test "link generation logic", `createPaymentLink` (which called by autoGenerate)
        // creates a URL string. 

        // Actually, `autoGeneratePaymentLink` calls `decryptPaymentCredential`. If I store "encrypted_mock_key" and `decrypt` fails, it might crash.
        // Let's try to grab `encryptPaymentCredential` from the actual file.

        // For now, let's just create the credential and see if `autoGeneratePaymentLink` works (it might fail on decryption).
        // If it fails, that confirms the flow *attempts* to use it.

        await prisma.paymentCredential.upsert({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: 'stripe'
                }
            },
            update: {
                isActive: true,
                isTestMode: true,
            },
            create: {
                userId: user.id,
                provider: 'stripe',
                publicKey: 'pk_test_mock123',
                secretKey: 'sk_test_mock123_encrypted', // This technically should be encrypted
                isActive: true,
                isTestMode: true
            }
        });
        console.log('✅ Added Stripe credentials');

        // 3. Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                userId: user.id,
                invoiceNumber: `TEST-PAY-${Date.now()}`,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 86400000),
                companyInfo: { name: 'Test Company' },
                clientInfo: { name: 'Test Client' },
                lineItems: [{ description: 'Test Item', quantity: 1, rate: 100, amount: 100 }],
                subtotal: 100,
                total: 100,
                currency: 'USD',
                paymentStatus: 'pending'
            }
        });
        console.log('✅ Created Invoice:', invoice.id);

        // 4. Trigger Auto-link Generation
        // We import the real function to test it
        console.log('🔄 Attempting to generate payment link...');
        const result = await autoGeneratePaymentLink(invoice.id, user.id, 100);

        if (result && result.paymentLink) {
            console.log('🎉 SUCCESS: Payment Link Generated!');
            console.log('🔗 Link:', result.paymentLink);

            // Update invoice manually (since the API would do this)
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: { paymentLink: result.paymentLink, paymentProvider: result.provider }
            });

            console.log(`🌍 YOU CAN VISIT: http://localhost:3000/pay/${invoice.invoiceNumber} (or similar if link format differs)`);
            // Note: The logic in `payment-links.ts` determines the format.
        } else {
            console.error('⚠️ Failed to generate payment link. Check console for decryption errors or provider logic.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
