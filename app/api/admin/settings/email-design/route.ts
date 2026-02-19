import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

// GET - Read current Email Design configuration
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getSystemSettings([
            'EMAIL_BRAND_LOGO',
            'EMAIL_BRAND_NAME',
            'EMAIL_PRIMARY_COLOR',
            'EMAIL_HEADER_BG',
            'EMAIL_FOOTER_TEXT',
            'EMAIL_SHOW_POWERED_BY',
        ]);

        return NextResponse.json({
            brandLogo: settings['EMAIL_BRAND_LOGO'] || '',
            brandName: settings['EMAIL_BRAND_NAME'] || 'InvoiceNaija',
            primaryColor: settings['EMAIL_PRIMARY_COLOR'] || '#4F46E5',
            headerBg: settings['EMAIL_HEADER_BG'] || '#ffffff',
            footerText: settings['EMAIL_FOOTER_TEXT'] || '',
            showPoweredBy: settings['EMAIL_SHOW_POWERED_BY'] !== 'false',
        });
    } catch (error) {
        console.error('Error reading Email Design config:', error);
        return NextResponse.json(
            { error: 'Failed to read configuration' },
            { status: 500 }
        );
    }
}

// POST - Save Email Design configuration
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            brandLogo,
            brandName,
            primaryColor,
            headerBg,
            footerText,
            showPoweredBy
        } = body;

        const settingsToSave = [
            { key: 'EMAIL_BRAND_LOGO', value: brandLogo || '', description: 'URL for email logo' },
            { key: 'EMAIL_BRAND_NAME', value: brandName || 'InvoiceNaija', description: 'Brand name for emails' },
            { key: 'EMAIL_PRIMARY_COLOR', value: primaryColor || '#4F46E5', description: 'Primary accent color for emails' },
            { key: 'EMAIL_HEADER_BG', value: headerBg || '#ffffff', description: 'Background color for email header' },
            { key: 'EMAIL_FOOTER_TEXT', value: footerText || '', description: 'Custom footer text for emails' },
            { key: 'EMAIL_SHOW_POWERED_BY', value: showPoweredBy ? 'true' : 'false', description: 'Show Powered By link in emails' },
        ];

        await saveSystemSettings(settingsToSave);

        return NextResponse.json({
            success: true,
            message: 'Email design settings saved successfully!',
        });
    } catch (error: any) {
        console.error('Error saving Email Design config:', error);
        return NextResponse.json(
            { error: `Failed to save: ${error.message}` },
            { status: 500 }
        );
    }
}
