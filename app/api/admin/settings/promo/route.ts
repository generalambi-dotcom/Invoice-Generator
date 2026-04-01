import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const SETTING_KEY = 'global_promo_banner_config';

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY },
        });

        if (setting) {
            return NextResponse.json(JSON.parse(setting.value));
        }

        // Return defaults if not found
        return NextResponse.json({
            enabled: false,
            text: 'LIMITED TIME 90% OFF InvoiceGenerator for a year* Making Tax Digital. For less.',
            endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
            linkText: 'Buy now',
            linkUrl: '/upgrade',
            bgColor: '#52e85a', // The light green from the screenshot
        });
    } catch (error) {
        console.error('Error fetching promo config:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.isAdmin)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Validate basic fields (you'd typically use Zod here but keeping it lightweight)
        const configToSave = {
            enabled: !!body.enabled,
            text: body.text || '',
            endDate: body.endDate || new Date().toISOString(),
            linkText: body.linkText || 'Buy now',
            linkUrl: body.linkUrl || '/upgrade',
            bgColor: body.bgColor || '#52e85a',
        };

        const updatedSetting = await prisma.systemSetting.upsert({
            where: { key: SETTING_KEY },
            update: { value: JSON.stringify(configToSave) },
            create: {
                key: SETTING_KEY,
                value: JSON.stringify(configToSave),
                description: 'Configuration for the global promo banner shown above the header',
            },
        });

        return NextResponse.json(JSON.parse(updatedSetting.value));
    } catch (error) {
        console.error('Error updating promo config:', error);
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}
