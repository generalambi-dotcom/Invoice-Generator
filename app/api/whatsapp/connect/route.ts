import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Encryption key (should match admin settings)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * POST - Connect user's WhatsApp account
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if WhatsApp is enabled
    const globalSettings = await prisma.whatsAppSettings.findUnique({
      where: { provider: 'twilio' },
    });

    if (!globalSettings?.isEnabled) {
      return NextResponse.json(
        { error: 'WhatsApp integration is not enabled. Please contact admin.' },
        { status: 403 }
      );
    }

    if (!globalSettings.allowUserConnections) {
      return NextResponse.json(
        { error: 'User WhatsApp connections are not allowed. Please contact admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phoneNumber } = body;

    // Validate phone number format (should include country code)
    if (!phoneNumber || !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use international format: +1234567890' },
        { status: 400 }
      );
    }

    // Check if phone number is already connected
    const existing = await prisma.whatsAppCredential.findFirst({
      where: { phoneNumber, isActive: true },
    });

    if (existing && existing.userId !== user.userId) {
      return NextResponse.json(
        { error: 'This phone number is already connected to another account' },
        { status: 400 }
      );
    }

    // Create or update WhatsApp credential
    const credential = await prisma.whatsAppCredential.upsert({
      where: { userId: user.userId },
      update: {
        phoneNumber,
        isActive: true,
        isVerified: false, // Will be verified when first message is received
        updatedAt: new Date(),
      },
      create: {
        userId: user.userId,
        phoneNumber,
        provider: globalSettings.provider || 'twilio',
        isActive: true,
        isVerified: false,
      },
    });

    console.log(`✅ WhatsApp connected for user ${user.userId}: ${phoneNumber}`);

    return NextResponse.json({
      credential: {
        id: credential.id,
        phoneNumber: credential.phoneNumber,
        isVerified: credential.isVerified,
        provider: credential.provider,
      },
      message: 'WhatsApp connected successfully! Send a test message to verify.',
    });
  } catch (error: any) {
    console.error('Error connecting WhatsApp:', error);
    return NextResponse.json(
      { error: 'Failed to connect WhatsApp' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get user's WhatsApp connection status
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credential = await prisma.whatsAppCredential.findUnique({
      where: { userId: user.userId },
    });

    if (!credential) {
      return NextResponse.json({ credential: null });
    }

    return NextResponse.json({
      credential: {
        id: credential.id,
        phoneNumber: credential.phoneNumber,
        isActive: credential.isActive,
        isVerified: credential.isVerified,
        verifiedAt: credential.verifiedAt,
        lastMessageAt: credential.lastMessageAt,
        provider: credential.provider,
      },
    });
  } catch (error: any) {
    console.error('Error fetching WhatsApp connection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp connection' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Disconnect user's WhatsApp
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.whatsAppCredential.delete({
      where: { userId: user.userId },
    });

    console.log(`✅ WhatsApp disconnected for user ${user.userId}`);

    return NextResponse.json({ message: 'WhatsApp disconnected successfully' });
  } catch (error: any) {
    console.error('Error disconnecting WhatsApp:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect WhatsApp' },
      { status: 500 }
    );
  }
}

