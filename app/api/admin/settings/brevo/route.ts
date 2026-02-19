import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';

// GET - Read current Brevo configuration
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = process.env.BREVO_API_KEY || '';
        const listId = process.env.BREVO_LIST_ID || '';
        const popupEnabled = process.env.BREVO_POPUP_ENABLED !== 'false'; // default true

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

// POST - Save Brevo configuration to .env file
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

        // Read existing .env file
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = '';

        try {
            envContent = fs.readFileSync(envPath, 'utf-8');
        } catch {
            // .env file doesn't exist yet
        }

        // Helper to upsert an env var
        const upsertEnvVar = (content: string, key: string, value: string): string => {
            const line = `${key}="${value}"`;
            const regex = new RegExp(`${key}=.*`);
            if (regex.test(content)) {
                return content.replace(regex, line);
            } else {
                return content.trimEnd() + '\n' + line + '\n';
            }
        };

        // Add section header if none of the Brevo vars exist yet
        if (!envContent.includes('BREVO_API_KEY=')) {
            envContent = envContent.trimEnd() + '\n\n# Brevo (Newsletter)\n';
        }

        envContent = upsertEnvVar(envContent, 'BREVO_API_KEY', apiKey.trim());
        envContent = upsertEnvVar(envContent, 'BREVO_LIST_ID', (listId || '').toString().trim());
        envContent = upsertEnvVar(envContent, 'BREVO_POPUP_ENABLED', popupEnabled !== false ? 'true' : 'false');

        // Write back to .env
        fs.writeFileSync(envPath, envContent, 'utf-8');

        return NextResponse.json({
            success: true,
            message: 'Brevo configuration saved. Restart the server (npm run dev) for changes to take effect.',
        });
    } catch (error) {
        console.error('Error saving Brevo config:', error);
        return NextResponse.json(
            { error: 'Failed to save Brevo configuration' },
            { status: 500 }
        );
    }
}
