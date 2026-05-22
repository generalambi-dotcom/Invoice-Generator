import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// PUT - Update expense
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const existing = await prisma.expense.findUnique({ where: { id: params.id } });
        if (!existing) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        if (existing.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { amount, currency, category, date, description, vendor, notes, receiptUrl } = body;

        const updated = await prisma.expense.update({
            where: { id: params.id },
            data: {
                ...(amount !== undefined && { amount: Number(amount) }),
                ...(currency && { currency }),
                ...(category && { category }),
                ...(date && { date: new Date(date) }),
                ...(description && { description }),
                ...(vendor !== undefined && { vendor: vendor || null }),
                ...(notes !== undefined && { notes: notes || null }),
                ...(receiptUrl !== undefined && { receiptUrl: receiptUrl || null }),
            },
        });

        return NextResponse.json({ expense: updated });
    } catch (error: any) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }
}

// DELETE - Delete expense
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const existing = await prisma.expense.findUnique({ where: { id: params.id } });
        if (!existing) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        if (existing.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await prisma.expense.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
}
