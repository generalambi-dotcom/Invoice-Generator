import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// GET - List all businesses opted into the directory
export async function GET(request: NextRequest) {
    try {
        const admin = getAuthenticatedUser(request);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const where: any = { directoryOptIn: true };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [businesses, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    industry: true,
                    businessType: true,
                    companySize: true,
                    lastActiveAt: true,
                    dirShowName: true,
                    dirShowIndustry: true,
                    dirShowLocation: true,
                    dirShowSize: true,
                    dirShowActivity: true,
                },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({
            businesses,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });

    } catch (error: any) {
        console.error('Error fetching directory businesses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch directory businesses' },
            { status: 500 }
        );
    }
}
