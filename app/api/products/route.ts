import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET /api/products — list all products for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const products = await prisma.product.findMany({
      where: { userId: user.userId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — create a new product
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, defaultRate, unit, taxable } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        userId: user.userId,
        name: name.trim(),
        description: description?.trim() || null,
        defaultRate: parseFloat(defaultRate) || 0,
        unit: unit?.trim() || null,
        taxable: Boolean(taxable),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
