import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Auth check
        const user = await getCurrentUser(request);
        if (!user || null || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const category = searchParams.get('category');
        const level = searchParams.get('level');

        // Build filter
        const where: any = {};
        if (category) where.category = category;
        if (level) where.level = level;

        // Fetch logs
        const [logs, total] = await Promise.all([
            prisma.systemLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.systemLog.count({ where }),
        ]);

        return NextResponse.json({ logs, total }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching system logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}
