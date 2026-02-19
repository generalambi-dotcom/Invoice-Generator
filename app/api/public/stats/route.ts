import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic to ensure we always get the latest count
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cash for 60 seconds

export async function GET() {
    try {
        const count = await prisma.invoice.count();
        // Since we want to start from 200,512, let's return count + 200512
        const total = 200512 + count;

        return NextResponse.json({ total });
    } catch (error) {
        console.error('Failed to fetch invoice stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
