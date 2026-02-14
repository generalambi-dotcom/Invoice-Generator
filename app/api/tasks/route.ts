import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    isCompleted: z.boolean().optional(),
    dueDate: z.string().optional().nullable(), // Dates come as strings from JSON
    priority: z.enum(['low', 'medium', 'high']).optional(),
});

// GET: Fetch all tasks
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tasks = await prisma.task.findMany({
            where: { userId: user.userId },
            orderBy: [
                { isCompleted: 'asc' }, // Pending first
                { dueDate: 'asc' },     // Soonest due first
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST: Create a new task
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validated = TaskSchema.parse(body);

        const task = await prisma.task.create({
            data: {
                userId: user.userId,
                title: validated.title,
                priority: validated.priority,
                dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
                isCompleted: validated.isCompleted || false
            }
        });

        return NextResponse.json(task);
    } catch (error: any) {
        console.error('Error creating task:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

// DELETE: Delete a task
export async function DELETE(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

        await prisma.task.delete({
            where: {
                id,
                userId: user.userId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}

// PUT: Update a task
export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

        // Handle date string to Date object
        if (data.dueDate) {
            data.dueDate = new Date(data.dueDate);
        }

        const task = await prisma.task.update({
            where: {
                id,
                userId: user.userId
            },
            data
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
