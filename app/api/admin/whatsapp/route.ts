import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { encrypt, decrypt } from '@/lib/encryption';

// Force dynamic rendering
export const dynamic = 'force-dynamic';


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

    // Get WhatsApp settings - prioritize enabled one
    let settings = await prisma.whatsAppSettings.findFirst({
      where: { isEnabled: true },
    });

    // If no enabled settings, verify if any exist (e.g. Meta disabled)
    if (!settings) {
      settings = await prisma.whatsAppSettings.findFirst();
    }

    // If absolutely no settings exist, create default Twilio
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
      twilioAccountSid: twilioAccountSid ? twilioAccountSid.trim() : undefined,
      twilioAuthToken: twilioAuthToken && twilioAuthToken !== '***encrypted***'
        ? encrypt(twilioAuthToken.trim())
        : undefined,
      twilioWhatsAppNumber: twilioWhatsAppNumber ? twilioWhatsAppNumber.trim() : undefined,
      metaAppId: metaAppId ? metaAppId.trim() : undefined,
      metaAppSecret: metaAppSecret && metaAppSecret !== '***encrypted***'
        ? encrypt(metaAppSecret.trim())
        : undefined,
      metaAccessToken: metaAccessToken && metaAccessToken !== '***encrypted***'
        ? encrypt(metaAccessToken.trim())
        : undefined,
      metaPhoneNumberId: metaPhoneNumberId ? metaPhoneNumberId.trim() : undefined,
      metaBusinessAccountId: metaBusinessAccountId ? metaBusinessAccountId.trim() : undefined,
      webhookUrl: webhookUrl ? webhookUrl.trim() : undefined,
      webhookSecret: webhookSecret && webhookSecret !== '***encrypted***'
        ? encrypt(webhookSecret.trim())
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

    // If enabling this provider, disable others to prevent conflicts
    if (isEnabled) {
      await prisma.whatsAppSettings.updateMany({
        where: {
          provider: { not: provider || 'twilio' }
        },
        data: { isEnabled: false }
      });
    }

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

