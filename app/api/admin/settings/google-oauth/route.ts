import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';

// POST - Save Google OAuth credentials to .env file
export async function POST(request: NextRequest) {
    try {
        console.log('[Google OAuth] POST request received');

        const user = getAuthenticatedUser(request);
        console.log('[Google OAuth] Authenticated user:', user ? `${user.email} (admin: ${user.isAdmin})` : 'null');

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized - please log in as admin' }, { status: 401 });
        }

        const body = await request.json();
        const { clientId, clientSecret } = body;
        console.log('[Google OAuth] Client ID provided:', !!clientId, 'length:', clientId?.length);
        console.log('[Google OAuth] Client Secret provided:', !!clientSecret);

        if (!clientId || typeof clientId !== 'string') {
            return NextResponse.json({ error: 'Google Client ID is required' }, { status: 400 });
        }

        // Validate the format
        if (!clientId.endsWith('.apps.googleusercontent.com')) {
            console.log('[Google OAuth] Validation failed - Client ID ends with:', clientId.substring(Math.max(0, clientId.length - 30)));
            return NextResponse.json(
                { error: 'Invalid Client ID format. It should end with .apps.googleusercontent.com' },
                { status: 400 }
            );
        }

        // Read existing .env file
        const envPath = path.resolve(process.cwd(), '.env');
        console.log('[Google OAuth] .env path:', envPath);
        let envContent = '';

        try {
            envContent = fs.readFileSync(envPath, 'utf-8');
            console.log('[Google OAuth] .env file read OK, length:', envContent.length);
        } catch (readError: any) {
            console.log('[Google OAuth] .env read error:', readError.message);
        }

        // Update or add NEXT_PUBLIC_GOOGLE_CLIENT_ID
        const clientIdLine = `NEXT_PUBLIC_GOOGLE_CLIENT_ID="${clientId}"`;
        if (envContent.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID=')) {
            envContent = envContent.replace(
                /NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*/,
                clientIdLine
            );
        } else {
            envContent = envContent.trimEnd() + '\n\n# Google OAuth\n' + clientIdLine + '\n';
        }

        // Update or add GOOGLE_CLIENT_SECRET if provided
        if (clientSecret && clientSecret.trim()) {
            const secretLine = `GOOGLE_CLIENT_SECRET="${clientSecret.trim()}"`;
            if (envContent.includes('GOOGLE_CLIENT_SECRET=')) {
                envContent = envContent.replace(
                    /GOOGLE_CLIENT_SECRET=.*/,
                    secretLine
                );
            } else {
                envContent = envContent.trimEnd() + '\n' + secretLine + '\n';
            }
        }

        // Write back to .env
        console.log('[Google OAuth] Writing .env file...');
        fs.writeFileSync(envPath, envContent, 'utf-8');
        console.log('[Google OAuth] .env written successfully!');

        return NextResponse.json({
            success: true,
            message: 'Google OAuth credentials saved to .env. Restart the server for changes to take effect.',
        });
    } catch (error: any) {
        console.error('[Google OAuth] ERROR:', error.message);
        console.error('[Google OAuth] Stack:', error.stack);
        return NextResponse.json(
            { error: `Failed to save: ${error.message}` },
            { status: 500 }
        );
    }
}
