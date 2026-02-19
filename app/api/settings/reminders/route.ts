import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await prisma.invoiceReminderSettings.findUnique({
            where: { userId: user.userId },
        });

        if (!settings) {
            // Return defaults if none exist yet
            return NextResponse.json({
                enableEmail: true,
                enableWhatsApp: false,
                remindBeforeDue: 3,
                remindOnDue: true,
                remindAfterDue1: 3,
                remindAfterDue2: 7,
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch reminder settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reminder settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            enableEmail,
            enableWhatsApp,
            remindBeforeDue,
            remindOnDue,
            remindAfterDue1,
            remindAfterDue2,
        } = body;

        const settings = await prisma.invoiceReminderSettings.upsert({
            where: { userId: user.userId },
            update: {
                enableEmail,
                enableWhatsApp,
                remindBeforeDue,
                remindOnDue,
                remindAfterDue1,
                remindAfterDue2,
            },
            create: {
                userId: user.userId,
                enableEmail: enableEmail ?? true,
                enableWhatsApp: enableWhatsApp ?? false,
                remindBeforeDue: remindBeforeDue ?? 3,
                remindOnDue: remindOnDue ?? true,
                remindAfterDue1: remindAfterDue1 ?? 3,
                remindAfterDue2: remindAfterDue2 ?? 7,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to update reminder settings:', error);
        return NextResponse.json(
            { error: 'Failed to update reminder settings' },
            { status: 500 }
        );
    }
}
