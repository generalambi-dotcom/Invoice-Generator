import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TimeLogSchema = z.object({
    clientId: z.string().optional().nullable(),
    description: z.string().min(1, "Description is required"),
    startTime: z.string(), // ISO string
    endTime: z.string().optional().nullable(),
    duration: z.number().optional(), // In minutes
    rate: z.number().optional(),
    status: z.enum(['pending', 'billed']).optional(),
});

// GET: Fetch time logs
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const clientId = searchParams.get('clientId');

        const where: any = { userId: user.userId };
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;

        const logs = await prisma.timeLog.findMany({
            where,
            include: {
                client: { select: { name: true } }
            },
            orderBy: { startTime: 'desc' }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching time logs:', error);
        return NextResponse.json({ error: 'Failed to fetch time logs' }, { status: 500 });
    }
}

// POST: Create a new time log (Start Timer or Manual Entry)
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validated = TimeLogSchema.parse(body);

        // If starting a timer (endTime is null), stop any other running timers for this user?
        // Maybe not strict requirement, but good UX. Let's keep it simple for now.

        const log = await prisma.timeLog.create({
            data: {
                userId: user.userId,
                clientId: validated.clientId,
                description: validated.description,
                startTime: new Date(validated.startTime),
                endTime: validated.endTime ? new Date(validated.endTime) : null,
                duration: validated.duration || 0,
                rate: validated.rate || 0,
                status: validated.status || 'pending',
            }
        });

        return NextResponse.json(log);
    } catch (error: any) {
        console.error('Error creating time log:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create time log' }, { status: 500 });
    }
}

// PUT: Update time log (Stop Timer or Edit)
export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'TimeLog ID is required' }, { status: 400 });

        const log = await prisma.timeLog.update({
            where: { id, userId: user.userId },
            data: {
                ...data,
                startTime: data.startTime ? new Date(data.startTime) : undefined,
                endTime: data.endTime ? new Date(data.endTime) : undefined,
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error('Error updating time log:', error);
        return NextResponse.json({ error: 'Failed to update time log' }, { status: 500 });
    }
}

// DELETE: Remove time log
export async function DELETE(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.timeLog.delete({
            where: { id, userId: user.userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting time log:', error);
        return NextResponse.json({ error: 'Failed to delete time log' }, { status: 500 });
    }
}
