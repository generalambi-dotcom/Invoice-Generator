import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Encryption key (should be in env, but using a simple approach for now)
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

function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * GET - Get WhatsApp settings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get WhatsApp settings
    let settings = await prisma.whatsAppSettings.findUnique({
      where: { provider: 'twilio' },
    });

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.whatsAppSettings.create({
        data: {
          provider: 'twilio',
          isEnabled: false,
          allowUserConnections: true,
          messagesPerMinute: 60,
          messagesPerDay: 1000,
        },
      });
    }

    // Decrypt sensitive fields for display
    const decryptedSettings = {
      ...settings,
      twilioAuthToken: settings.twilioAuthToken ? '***encrypted***' : null,
      metaAppSecret: settings.metaAppSecret ? '***encrypted***' : null,
      metaAccessToken: settings.metaAccessToken ? '***encrypted***' : null,
      webhookSecret: settings.webhookSecret ? '***encrypted***' : null,
    };

    return NextResponse.json({ settings: decryptedSettings });
  } catch (error: any) {
    console.error('Error fetching WhatsApp settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update WhatsApp settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      provider,
      twilioAccountSid,
      twilioAuthToken,
      twilioWhatsAppNumber,
      metaAppId,
      metaAppSecret,
      metaAccessToken,
      metaPhoneNumberId,
      metaBusinessAccountId,
      webhookUrl,
      webhookSecret,
      isEnabled,
      allowUserConnections,
      messagesPerMinute,
      messagesPerDay,
    } = body;

    // Encrypt sensitive fields
    const updateData: any = {
      provider: provider || 'twilio',
      twilioAccountSid: twilioAccountSid || undefined,
      twilioAuthToken: twilioAuthToken && twilioAuthToken !== '***encrypted***' 
        ? encrypt(twilioAuthToken) 
        : undefined,
      twilioWhatsAppNumber: twilioWhatsAppNumber || undefined,
      metaAppId: metaAppId || undefined,
      metaAppSecret: metaAppSecret && metaAppSecret !== '***encrypted***'
        ? encrypt(metaAppSecret)
        : undefined,
      metaAccessToken: metaAccessToken && metaAccessToken !== '***encrypted***'
        ? encrypt(metaAccessToken)
        : undefined,
      metaPhoneNumberId: metaPhoneNumberId || undefined,
      metaBusinessAccountId: metaBusinessAccountId || undefined,
      webhookUrl: webhookUrl || undefined,
      webhookSecret: webhookSecret && webhookSecret !== '***encrypted***'
        ? encrypt(webhookSecret)
        : undefined,
      isEnabled: isEnabled !== undefined ? isEnabled : false,
      allowUserConnections: allowUserConnections !== undefined ? allowUserConnections : true,
      messagesPerMinute: messagesPerMinute || 60,
      messagesPerDay: messagesPerDay || 1000,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Upsert settings
    const settings = await prisma.whatsAppSettings.upsert({
      where: { provider: provider || 'twilio' },
      update: updateData,
      create: {
        provider: provider || 'twilio',
        ...updateData,
      },
    });

    console.log(`✅ WhatsApp settings updated by admin ${user.userId}`);

    return NextResponse.json({
      settings: {
        ...settings,
        twilioAuthToken: settings.twilioAuthToken ? '***encrypted***' : null,
        metaAppSecret: settings.metaAppSecret ? '***encrypted***' : null,
        metaAccessToken: settings.metaAccessToken ? '***encrypted***' : null,
        webhookSecret: settings.webhookSecret ? '***encrypted***' : null,
      },
      message: 'WhatsApp settings updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating WhatsApp settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update WhatsApp settings',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

