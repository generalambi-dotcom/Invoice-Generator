import { NextResponse } from 'next/server';
import { getSystemSetting } from '@/lib/settings';

// GET - Public endpoint to get Google Client ID for the sign-in button
// This is safe to expose publicly since Google Client IDs are designed to be public
export async function GET() {
    try {
        const clientId = await getSystemSetting('NEXT_PUBLIC_GOOGLE_CLIENT_ID');

        return NextResponse.json({
            clientId: clientId || null,
        });
    } catch (error) {
        console.error('Error fetching Google config:', error);
        return NextResponse.json({ clientId: null });
    }
}
