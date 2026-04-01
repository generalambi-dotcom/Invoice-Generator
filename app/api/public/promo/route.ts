import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SETTING_KEY = 'global_promo_banner_config';

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY },
        });

        if (setting) {
            return NextResponse.json(JSON.parse(setting.value));
        }

        return NextResponse.json({
            enabled: false,
            text: 'LIMITED TIME 90% OFF InvoiceGenerator for a year* Making Tax Digital. For less.',
            endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            linkText: 'Buy now',
            linkUrl: '/upgrade',
            bgColor: '#52e85a',
        });
    } catch (error) {
        console.error('Error fetching public promo config:', error);
        return NextResponse.json({ enabled: false });
    }
}
