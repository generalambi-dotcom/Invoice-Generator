import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

// GET - Read current LLM configuration
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getSystemSettings([
            'LLM_PROVIDER',
            'LLM_API_KEY',
        ]);

        const provider = settings['LLM_PROVIDER'] || 'openai';
        const apiKey = settings['LLM_API_KEY'] || '';

        // Mask the API key for display
        const maskedKey = apiKey
            ? apiKey.substring(0, 4) + '••••••••••••••••' + apiKey.substring(apiKey.length - 4)
            : '';

        return NextResponse.json({
            status: apiKey ? 'configured' : 'not_configured',
            provider,
            apiKey: maskedKey,
        });
    } catch (error) {
        console.error('Error reading LLM config:', error);
        return NextResponse.json(
            { error: 'Failed to read LLM configuration' },
            { status: 500 }
        );
    }
}

// POST - Save LLM configuration to database
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { provider, apiKey, isUpdateKey } = body;

        if (!provider || typeof provider !== 'string') {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        // Build settings to save
        const settingsToSave: Array<{ key: string; value: string; description?: string }> = [
            { key: 'LLM_PROVIDER', value: provider.trim(), description: 'Active Large Language Model Provider (e.g. openai, deepseek)' },
        ];

        // Only save the API key if explicitly provided
        if (isUpdateKey) {
            if (!apiKey || typeof apiKey !== 'string') {
                return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
            }
            settingsToSave.push({ key: 'LLM_API_KEY', value: apiKey.trim(), description: 'API Key for the LLM Provider' });
        }

        await saveSystemSettings(settingsToSave);

        return NextResponse.json({
            success: true,
            message: 'LLM configuration saved successfully!',
        });
    } catch (error: any) {
        console.error('Error saving LLM config:', error);
        return NextResponse.json(
            { error: `Failed to save: ${error.message}` },
            { status: 500 }
        );
    }
}
