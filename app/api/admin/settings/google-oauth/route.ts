import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';

// POST - Save Google OAuth credentials to .env file
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        // Read existing .env file
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = '';

        try {
            envContent = fs.readFileSync(envPath, 'utf-8');
        } catch {
            // .env file doesn't exist yet, that's fine
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
        fs.writeFileSync(envPath, envContent, 'utf-8');

        return NextResponse.json({
            success: true,
            message: 'Google OAuth credentials saved to .env. Restart the server for changes to take effect.',
        });
    } catch (error) {
        console.error('Error saving Google OAuth credentials:', error);
        return NextResponse.json(
            { error: 'Failed to save Google OAuth credentials' },
            { status: 500 }
        );
    }
}
