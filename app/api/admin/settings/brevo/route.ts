import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

// GET - Read current Brevo configuration
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getSystemSettings([
            'BREVO_API_KEY',
            'BREVO_LIST_ID',
            'BREVO_POPUP_ENABLED',
        ]);

        const apiKey = settings['BREVO_API_KEY'] || '';
        const listId = settings['BREVO_LIST_ID'] || '';
        const popupEnabled = settings['BREVO_POPUP_ENABLED'] !== 'false';

        // Mask the API key for display
        const maskedKey = apiKey
            ? apiKey.substring(0, 8) + '••••••••' + apiKey.substring(apiKey.length - 4)
            : '';

        return NextResponse.json({
            status: apiKey ? 'configured' : 'not_configured',
            apiKey: maskedKey,
            listId,
            popupEnabled,
        });
    } catch (error) {
        console.error('Error reading Brevo config:', error);
        return NextResponse.json(
            { error: 'Failed to read Brevo configuration' },
            { status: 500 }
        );
    }
}

// POST - Save Brevo configuration to database
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { apiKey, listId, popupEnabled } = body;

        if (!apiKey || typeof apiKey !== 'string') {
            return NextResponse.json({ error: 'Brevo API Key is required' }, { status: 400 });
        }

        // Validate API key format (Brevo keys start with "xkeysib-")
        if (!apiKey.startsWith('xkeysib-')) {
            return NextResponse.json(
                { error: 'Invalid API Key format. Brevo API keys start with "xkeysib-"' },
                { status: 400 }
            );
        }

        // Save to database
        await saveSystemSettings([
            { key: 'BREVO_API_KEY', value: apiKey.trim(), description: 'Brevo API Key' },
            { key: 'BREVO_LIST_ID', value: (listId || '').toString().trim(), description: 'Brevo Contact List ID' },
            { key: 'BREVO_POPUP_ENABLED', value: popupEnabled !== false ? 'true' : 'false', description: 'Newsletter popup enabled' },
        ]);

        return NextResponse.json({
            success: true,
            message: 'Brevo configuration saved successfully!',
        });
    } catch (error: any) {
        console.error('Error saving Brevo config:', error);
        return NextResponse.json(
            { error: `Failed to save: ${error.message}` },
            { status: 500 }
        );
    }
}
