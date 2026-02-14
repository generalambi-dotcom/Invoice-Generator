
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

// GET - List all users with pagination and search
export async function GET(request: NextRequest) {
    try {
        const admin = getAuthenticatedUser(request);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                    createdAt: true,
                    subscriptionPlan: true,
                    subscriptionStatus: true,
                    emailVerified: true,
                    _count: {
                        select: { invoices: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });

    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST - Create a new user manually
export async function POST(request: NextRequest) {
    try {
        // Check admin auth
        const admin = getAuthenticatedUser(request);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password, isAdmin, subscriptionPlan } = body;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                isAdmin: isAdmin || false,
                subscriptionPlan: subscriptionPlan || 'free',
                subscriptionStatus: subscriptionPlan === 'premium' ? 'active' : 'active', // Default to active for manual creation
                emailVerified: true, // Auto-verify manually created users
            },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                subscriptionPlan: true,
                createdAt: true
            }
        });

        return NextResponse.json({ user: newUser }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
