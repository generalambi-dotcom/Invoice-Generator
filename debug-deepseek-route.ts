import 'dotenv/config';
import { verifyLLMConnection } from './lib/llm/providers';
import { prisma } from './lib/db';
import { decrypt } from './lib/encryption';

async function main() {
    console.log('--- Debugging DeepSeek Connection ---');

    // 1. Fetch settings from DB
    console.log('Fetching DeepSeek settings from DB...');
    const settings = await prisma.lLMSettings.findFirst({
        where: { provider: 'deepseek' }
    });

    if (!settings) {
        console.error('No DeepSeek settings found in DB!');
        return;
    }

    console.log('Settings found:', {
        provider: settings.provider,
        model: settings.model,
        hasApiKey: !!settings.apiKey
    });

    if (!settings.apiKey) {
        console.error('API Key is missing in DB settings.');
        return;
    }

    // 2. Decrypt Key
    let apiKey = '';
    try {
        apiKey = decrypt(settings.apiKey);
        console.log('Decrypted API Key length:', apiKey.length);
        console.log('Key starts with:', apiKey.substring(0, 5) + '...');
    } catch (e) {
        console.error('Failed to decrypt API key:', e);
        return;
    }

    // 3. Test Connection
    console.log('Testing connection with decrypted key...');
    const config = {
        provider: 'deepseek' as const,
        apiKey: apiKey,
        model: settings.model || 'deepseek-chat'
    };

    const result = await verifyLLMConnection(config);
    console.log('Verification Result:', result);
}

main().catch(console.error);
