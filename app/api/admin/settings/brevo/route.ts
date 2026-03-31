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
            'BREVO_POPUP_HEADING',
            'BREVO_POPUP_SUBTITLE',
            'BREVO_POPUP_BUTTON_TEXT',
            'BREVO_POPUP_SUCCESS_MSG',
            'BREVO_POPUP_ACCENT_COLOR',
            'BREVO_POPUP_POSITION',
            'BREVO_POPUP_DELAY',
            'BREVO_POPUP_COOLDOWN_DAYS',
            'BREVO_POPUP_SHOW_NAME',
            'BREVO_CUSTOMER_LIST_ID',
        ]);

        const apiKey = settings['BREVO_API_KEY'] || '';
        const listId = settings['BREVO_LIST_ID'] || '';
        const customerListId = settings['BREVO_CUSTOMER_LIST_ID'] || '2';
        const popupEnabled = settings['BREVO_POPUP_ENABLED'] !== 'false';

        // Mask the API key for display
        const maskedKey = apiKey
            ? apiKey.substring(0, 8) + '••••••••' + apiKey.substring(apiKey.length - 4)
            : '';

        return NextResponse.json({
            status: apiKey ? 'configured' : 'not_configured',
            apiKey: maskedKey,
            listId,
            customerListId,
            popupEnabled,
            popup: {
                heading: settings['BREVO_POPUP_HEADING'] || '',
                subtitle: settings['BREVO_POPUP_SUBTITLE'] || '',
                buttonText: settings['BREVO_POPUP_BUTTON_TEXT'] || '',
                successMessage: settings['BREVO_POPUP_SUCCESS_MSG'] || '',
                accentColor: settings['BREVO_POPUP_ACCENT_COLOR'] || 'blue',
                position: settings['BREVO_POPUP_POSITION'] || 'center',
                delaySeconds: parseInt(settings['BREVO_POPUP_DELAY'] || '8', 10),
                cooldownDays: parseInt(settings['BREVO_POPUP_COOLDOWN_DAYS'] || '7', 10),
                showNameField: settings['BREVO_POPUP_SHOW_NAME'] !== 'false',
            },
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
        const { apiKey, listId, customerListId, popupEnabled, popup } = body;

        if (!apiKey || typeof apiKey !== 'string') {
            return NextResponse.json({ error: 'Brevo API Key is required' }, { status: 400 });
        }

        const isMaskedKey = apiKey.includes('••••••••');

        // Validate API key format (Brevo keys start with "xkeysib-")
        if (!isMaskedKey && !apiKey.startsWith('xkeysib-')) {
            return NextResponse.json(
                { error: 'Invalid API Key format. Brevo API keys start with "xkeysib-"' },
                { status: 400 }
            );
        }

        // Build settings to save
        const settingsToSave: Array<{ key: string; value: string; description?: string }> = [
            { key: 'BREVO_LIST_ID', value: (listId || '').toString().trim(), description: 'Brevo Contact List ID' },
            { key: 'BREVO_CUSTOMER_LIST_ID', value: (customerListId || '2').toString().trim(), description: 'Brevo Active Customer List ID' },
            { key: 'BREVO_POPUP_ENABLED', value: popupEnabled !== false ? 'true' : 'false', description: 'Newsletter popup enabled' },
        ];

        // Only save the API key if it wasn't masked
        if (!isMaskedKey) {
            settingsToSave.push({ key: 'BREVO_API_KEY', value: apiKey.trim(), description: 'Brevo API Key' });
        }

        // Save popup customization settings if provided
        if (popup && typeof popup === 'object') {
            if (popup.heading !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_HEADING', value: popup.heading || '', description: 'Popup heading text' });
            }
            if (popup.subtitle !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_SUBTITLE', value: popup.subtitle || '', description: 'Popup subtitle text' });
            }
            if (popup.buttonText !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_BUTTON_TEXT', value: popup.buttonText || '', description: 'Popup subscribe button text' });
            }
            if (popup.successMessage !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_SUCCESS_MSG', value: popup.successMessage || '', description: 'Popup success message' });
            }
            if (popup.accentColor !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_ACCENT_COLOR', value: popup.accentColor || 'blue', description: 'Popup accent color' });
            }
            if (popup.position !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_POSITION', value: popup.position || 'center', description: 'Popup position on screen' });
            }
            if (popup.delaySeconds !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_DELAY', value: String(popup.delaySeconds ?? 8), description: 'Popup delay in seconds' });
            }
            if (popup.cooldownDays !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_COOLDOWN_DAYS', value: String(popup.cooldownDays ?? 7), description: 'Popup cooldown in days' });
            }
            if (popup.showNameField !== undefined) {
                settingsToSave.push({ key: 'BREVO_POPUP_SHOW_NAME', value: popup.showNameField !== false ? 'true' : 'false', description: 'Show name field in popup' });
            }
        }

        await saveSystemSettings(settingsToSave);

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
