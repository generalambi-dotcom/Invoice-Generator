
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// GET - Retrieve auth settings
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'auth_settings' }
        });

        // Default settings if not found
        const defaultSettings = {
            emailVerificationRequired: true,
        };

        const settings = setting ? JSON.parse(setting.value) : defaultSettings;

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching auth settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// POST - Update auth settings
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { emailVerificationRequired } = body;

        const settings = {
            emailVerificationRequired: !!emailVerificationRequired,
        };

        await prisma.systemSetting.upsert({
            where: { key: 'auth_settings' },
            update: {
                value: JSON.stringify(settings),
            },
            create: {
                key: 'auth_settings',
                value: JSON.stringify(settings),
                description: 'Global authentication settings',
            },
        });

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Error saving auth settings:', error);
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        );
    }
}
