import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// GET: Fetch single client with invoices
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await prisma.client.findUnique({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            invoiceDate: true,
            total: true,
            currency: true,
            paymentStatus: true
          }
        }
      }
    });

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

// PUT: Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    // remove id and userid from body to prevent tampering
    const { id, userId, invoices, createdAt, updatedAt, _count, ...data } = body;

    const client = await prisma.client.update({
      where: {
        id: params.id,
        userId: user.userId
      },
      data: {
        ...data,
        updatedAt: undefined // Let prisma handle updatedAt
      }
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE: Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.client.delete({
      where: {
        id: params.id,
        userId: user.userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
