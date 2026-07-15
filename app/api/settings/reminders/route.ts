import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { z } from 'zod';

const settingsSchema = z.object({
    enableEmail: z.boolean(),
    enableWhatsApp: z.boolean().optional(),
    remindBeforeDue: z.number().int().min(1).max(30).nullable(),
    remindOnDue: z.boolean(),
    remindAfterDue1: z.number().int().min(1).max(60).nullable(),
    remindAfterDue2: z.number().int().min(1).max(90).nullable(),
});

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
                enableEmail: false,
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

        const parsed = settingsSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: 'Please check the reminder schedule and try again.' }, { status: 400 });
        }
        const body = parsed.data;
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
                enableWhatsApp: false,
                remindBeforeDue,
                remindOnDue,
                remindAfterDue1,
                remindAfterDue2,
            },
            create: {
                userId: user.userId,
                enableEmail,
                enableWhatsApp: false,
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
