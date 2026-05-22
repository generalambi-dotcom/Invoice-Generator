import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET - List user's expenses with optional filters
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const from = searchParams.get('from');   // ISO date string
        const to = searchParams.get('to');       // ISO date string
        const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);

        const where: any = { userId: user.userId };
        if (category && category !== 'all') where.category = category;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
            take: limit,
        });

        // Aggregate totals by category for summary
        const allForPeriod = await prisma.expense.findMany({
            where,
            select: { amount: true, category: true, currency: true },
        });

        const totalAmount = allForPeriod.reduce((s, e) => s + e.amount, 0);
        const byCategory: Record<string, number> = {};
        for (const e of allForPeriod) {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        }

        return NextResponse.json({ expenses, summary: { totalAmount, byCategory, count: allForPeriod.length } });
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

// POST - Create expense
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { amount, currency, category, date, description, vendor, notes, receiptUrl } = body;

        if (!amount || !category || !date || !description) {
            return NextResponse.json(
                { error: 'amount, category, date, and description are required' },
                { status: 400 }
            );
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
        }

        const expense = await prisma.expense.create({
            data: {
                userId: user.userId,
                amount: Number(amount),
                currency: currency || 'NGN',
                category,
                date: new Date(date),
                description,
                vendor: vendor || null,
                notes: notes || null,
                receiptUrl: receiptUrl || null,
            },
        });

        return NextResponse.json({ expense }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}
