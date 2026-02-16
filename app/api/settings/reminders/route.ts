import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
    enableEmail: z.boolean(),
    enableWhatsApp: z.boolean(),
    remindBeforeDue: z.number().nullable(),
    remindOnDue: z.boolean(),
    remindAfterDue1: z.number().nullable(),
    remindAfterDue2: z.number().nullable(),
});

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let settings = await prisma.invoiceReminderSettings.findUnique({
            where: { userId: user.id },
        });

        if (!settings) {
            // Create default settings if not exists
            settings = await prisma.invoiceReminderSettings.create({
                data: {
                    userId: user.id,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching reminder settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const result = settingsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.format() },
                { status: 400 }
            );
        }

        const settings = await prisma.invoiceReminderSettings.upsert({
            where: { userId: user.id },
            update: result.data,
            create: {
                userId: user.id,
                ...result.data,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating reminder settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
