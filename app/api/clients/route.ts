import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get all clients for user
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {
      userId: user.userId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error('Error loading clients:', error);
    return NextResponse.json(
      { error: 'Failed to load clients' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new client
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      website,
      notes,
      tags,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        userId: user.userId,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        country: country || null,
        website: website || null,
        notes: notes || null,
        tags: tags || [],
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

