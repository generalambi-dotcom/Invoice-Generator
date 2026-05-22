import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// PUT /api/products/[id] — update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (existing.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, description, defaultRate, unit, taxable } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        defaultRate: parseFloat(defaultRate) || 0,
        unit: unit?.trim() || null,
        taxable: Boolean(taxable),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] — delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (existing.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
