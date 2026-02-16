
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * GET - Get WhatsApp public configuration (authenticated users)
 */
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get enabled status from WhatsAppSettings
        const settings = await prisma.whatsAppSettings.findFirst({
            where: { isEnabled: true }
        });

        // If no enabled settings, verify if any exist
        const anySettings = settings || await prisma.whatsAppSettings.findFirst();

        // Get display phone number from SystemSetting
        const publicConfig = await prisma.systemSetting.findUnique({
            where: { key: 'whatsapp_public_config' }
        });

        let displayPhoneNumber = '';
        if (publicConfig) {
            try {
                const config = JSON.parse(publicConfig.value);
                displayPhoneNumber = config.displayPhoneNumber || '';
            } catch (e) {
                console.error("Error parsing whatsapp_public_config:", e);
            }
        }

        // Fallback to Twilio number if no display number set
        if (!displayPhoneNumber && anySettings?.twilioWhatsAppNumber) {
            displayPhoneNumber = anySettings.twilioWhatsAppNumber;
        }

        return NextResponse.json({
            settings: {
                isEnabled: anySettings?.isEnabled || false,
                displayPhoneNumber,
            }
        });

    } catch (error: any) {
        console.error('Error fetching WhatsApp config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch WhatsApp configuration' },
            { status: 500 }
        );
    }
}
