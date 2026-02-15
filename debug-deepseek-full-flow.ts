import 'dotenv/config';
import { encrypt, decrypt } from './lib/encryption';
import { prisma } from './lib/db';
import { verifyLLMConnection } from './lib/llm/providers';

async function main() {
    console.log('--- Debugging Full DeepSeek Flow ---');

    // 1. Check Encryption Key Stability
    console.log('Checking ENCRYPTION_KEY...');
    if (!process.env.ENCRYPTION_KEY) {
        console.error('CRITICAL: ENCRYPTION_KEY is missing from process.env!');
        // Note: lib/encryption.ts might have a fallback or throw
    } else {
        console.log('ENCRYPTION_KEY is present. Length:', process.env.ENCRYPTION_KEY.length);
    }

    // 2. Simulate User Input
    const usersApiKey = process.argv[2];
    if (!usersApiKey) {
        console.error('Please provide a real API key to test with: npx tsx debug-deepseek-full-flow.ts sk-...');
        return;
    }
    console.log('Testing with provided key length:', usersApiKey.length);

    // 3. Encrypt
    console.log('Encrypting key...');
    let encrypted = '';
    try {
        encrypted = encrypt(usersApiKey);
        console.log('Encrypted string length:', encrypted.length);
    } catch (e) {
        console.error('Encryption failed:', e);
        return;
    }

    // 4. Save to DB (Simulate POST /api/admin/ai)
    console.log('Saving to DB...');
    try {
        await prisma.lLMSettings.upsert({
            where: { provider: 'deepseek' },
            create: {
                provider: 'deepseek',
                apiKey: encrypted,
                model: 'deepseek-chat',
                isEnabled: true
            },
            update: {
                apiKey: encrypted,
                model: 'deepseek-chat'
            }
        });
        console.log('Saved to DB successfully.');
    } catch (e) {
        console.error('DB Save failed:', e);
        return;
    }

    // 5. Retrieve from DB (Simulate GET /api/admin/ai or internal usage)
    console.log('Retrieving from DB...');
    const saved = await prisma.lLMSettings.findFirst({
        where: { provider: 'deepseek' }
    });

    if (!saved || !saved.apiKey) {
        console.error('Failed to retrieve record or apiKey is empty.');
        return;
    }

    // 6. Decrypt
    console.log('Decrypting key from DB...');
    let decrypted = '';
    try {
        decrypted = decrypt(saved.apiKey);
        console.log('Decrypted key matches input?', decrypted === usersApiKey);
        if (decrypted !== usersApiKey) {
            console.error('MISMATCH! Decrypted:', decrypted);
        }
    } catch (e) {
        console.error('Decryption failed:', e);
        return;
    }

    // 7. Verify Connection
    console.log('Verifying LLM Connection...');
    const result = await verifyLLMConnection({
        provider: 'deepseek',
        apiKey: decrypted,
        model: 'deepseek-chat'
    });
    console.log('Connection Result:', result);
}

main().catch(console.error);
