import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NoteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    category: z.string().optional(),
    color: z.enum(['blue', 'green', 'yellow', 'red', 'purple']).optional(),
    isPinned: z.boolean().optional(),
});

// GET: Fetch all notes
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const notes = await prisma.note.findMany({
            where: { userId: user.userId },
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' }
            ]
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

// POST: Create a new note
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validated = NoteSchema.parse(body);

        const note = await prisma.note.create({
            data: {
                userId: user.userId,
                ...validated
            }
        });

        return NextResponse.json(note);
    } catch (error: any) {
        console.error('Error creating note:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}

// DELETE: Delete a note (using query param ?id=...)
export async function DELETE(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

        await prisma.note.delete({
            where: {
                id,
                userId: user.userId // Ensure ownership
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}

// PUT: Update a note
export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

        // Validate partial update
        // We'll trust the input for now or use partial validation if strictly needed

        const note = await prisma.note.update({
            where: {
                id,
                userId: user.userId
            },
            data
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}
