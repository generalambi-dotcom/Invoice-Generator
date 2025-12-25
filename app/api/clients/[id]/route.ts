import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get single client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Error loading client:', error);
    return NextResponse.json(
      { error: 'Failed to load client' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update client
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
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

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(zip !== undefined && { zip: zip || null }),
        ...(country !== undefined && { country: country || null }),
        ...(website !== undefined && { website: website || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(tags !== undefined && { tags: tags || [] }),
      },
    });

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete client
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}

