import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { encrypt, decrypt } from '@/lib/encryption';
import { verifyLLMConnection } from '@/lib/llm/providers';
import { LLMConfig, LLMProvider } from '@/lib/llm/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { isAdmin: true },
        });

        if (!dbUser?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const settings = await prisma.lLMSettings.findFirst();

        if (!settings) {
            return NextResponse.json({ settings: null });
        }

        // Decrypt key for internal use? No, never send full key to client if possible.
        // We send a masked version or just empty string to indicate it's set.
        // For now, let's send it back decrypted so the user can see/edit it (classic simple admin behavior),
        // OR better, send specific field "isKeySet: true" and empty apiKey.

        // Let's send decrypted for now for simplicity in this MVP, but arguably we should mask it.
        let decryptedKey = '';
        if (settings.apiKey) {
            decryptedKey = decrypt(settings.apiKey);
        }

        // Mask the key for security in the UI
        const maskedKey = decryptedKey ? `${decryptedKey.substring(0, 3)}...${decryptedKey.substring(decryptedKey.length - 4)}` : '';

        return NextResponse.json({
            settings: {
                ...settings,
                apiKey: maskedKey, // Only send masked key
                isKeySet: !!settings.apiKey,
            }
        });

    } catch (error: any) {
        console.error('Error fetching AI settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { isAdmin: true },
        });

        if (!dbUser?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { action } = body;

        if (action === 'test') {
            const { provider, apiKey, model } = body;

            // If no API key provided in body, try to fetch from DB if we're testing saved settings
            let keyToUse = apiKey;
            if (!keyToUse || keyToUse.includes('...')) {
                const saved = await prisma.lLMSettings.findFirst({
                    where: { provider }
                });
                if (saved && saved.apiKey) {
                    keyToUse = decrypt(saved.apiKey);
                }
            }

            const config: LLMConfig = { provider, apiKey: keyToUse, model };
            const result = await verifyLLMConnection(config);
            return NextResponse.json(result);
        }

        // Save settings
        const { provider, apiKey, model, isEnabled, useSmartContext } = body;

        // Retrieve existing to handle key update logic
        const existing = await prisma.lLMSettings.findFirst({
            where: { provider }
        });

        let finalApiKey = existing?.apiKey;

        // If a new key is provided (and it's not the masked version), encrypt and update it
        if (apiKey && !apiKey.includes('...')) {
            finalApiKey = encrypt(apiKey);
        }

        if (isEnabled) {
            await prisma.lLMSettings.updateMany({
                where: { provider: { not: provider } },
                data: { isEnabled: false }
            });
        }

        const updated = await prisma.lLMSettings.upsert({
            where: { provider },
            create: {
                provider,
                apiKey: finalApiKey,
                model,
                isEnabled,
                useSmartContext,
            },
            update: {
                apiKey: finalApiKey,
                model,
                isEnabled,
                useSmartContext,
            },
        });

        return NextResponse.json({ success: true, settings: updated });

    } catch (error: any) {
        console.error('Error saving AI settings:', error);
        return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
    }
}
