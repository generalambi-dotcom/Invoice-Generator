import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { saveSystemSettings, getSystemSetting } from '@/lib/settings';

// POST - Save Google OAuth credentials to database
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized - please log in as admin' }, { status: 401 });
        }

        const body = await request.json();
        const { clientId, clientSecret } = body;

        if (!clientId || typeof clientId !== 'string') {
            return NextResponse.json({ error: 'Google Client ID is required' }, { status: 400 });
        }

        // Validate the format
        if (!clientId.endsWith('.apps.googleusercontent.com')) {
            return NextResponse.json(
                { error: 'Invalid Client ID format. It should end with .apps.googleusercontent.com' },
                { status: 400 }
            );
        }

        // Save to database
        const settings: Array<{ key: string; value: string; description?: string }> = [
            {
                key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
                value: clientId.trim(),
                description: 'Google OAuth Client ID',
            },
        ];

        if (clientSecret && clientSecret.trim()) {
            settings.push({
                key: 'GOOGLE_CLIENT_SECRET',
                value: clientSecret.trim(),
                description: 'Google OAuth Client Secret',
            });
        }

        await saveSystemSettings(settings);

        return NextResponse.json({
            success: true,
            message: 'Google OAuth credentials saved successfully!',
        });
    } catch (error: any) {
        console.error('[Google OAuth] Error saving credentials:', error);
        return NextResponse.json(
            { error: `Failed to save: ${error.message}` },
            { status: 500 }
        );
    }
}

// GET - Check current Google OAuth status
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clientId = await getSystemSetting('NEXT_PUBLIC_GOOGLE_CLIENT_ID');

        return NextResponse.json({
            status: clientId ? 'configured' : 'not_configured',
            clientId: clientId ? clientId.substring(0, 12) + '...' : '',
        });
    } catch (error: any) {
        console.error('[Google OAuth] Error checking status:', error);
        return NextResponse.json(
            { error: 'Failed to check status' },
            { status: 500 }
        );
    }
}
