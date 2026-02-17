import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// GET - Get a single template with full data
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const template = await prisma.invoiceTemplate.findFirst({
            where: {
                id: params.id,
                userId: user.userId,
            },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Increment usage count
        await prisma.invoiceTemplate.update({
            where: { id: params.id },
            data: { usageCount: { increment: 1 } },
        });

        return NextResponse.json({ template });
    } catch (error: any) {
        console.error('Error fetching template:', error);
        return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }
}

// DELETE - Delete a template
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.invoiceTemplate.deleteMany({
            where: {
                id: params.id,
                userId: user.userId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
