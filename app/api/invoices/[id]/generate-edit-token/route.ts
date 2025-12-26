import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoiceId = params.id;

    // Verify invoice belongs to user
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate unique token (32 bytes = 64 hex characters)
    const token = randomBytes(32).toString('hex');
    
    // Set expiry to 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    // Update invoice with token
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        editableToken: token,
        editableTokenExpiry: expiry,
      },
    });

    // Return the full edit URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   request.headers.get('origin') || 
                   'http://localhost:3000';
    const editUrl = `${baseUrl}/invoice/edit/${token}`;

    return NextResponse.json({ 
      token,
      editUrl,
      expiresAt: expiry.toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating edit token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate edit token' },
      { status: 500 }
    );
  }
}

