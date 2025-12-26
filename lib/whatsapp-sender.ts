/**
 * WhatsApp Message Sender
 * Handles sending messages and media via WhatsApp
 */

import { prisma } from '@/lib/db';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

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
 * Send WhatsApp message using Twilio
 */
async function sendViaTwilio(
  to: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const settings = await prisma.whatsAppSettings.findUnique({
      where: { provider: 'twilio' },
    });

    if (!settings || !settings.isEnabled) {
      return { success: false, error: 'WhatsApp is not enabled' };
    }

    if (!settings.twilioAccountSid || !settings.twilioAuthToken) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    const accountSid = settings.twilioAccountSid;
    const authToken = decrypt(settings.twilioAuthToken);
    const fromRaw = settings.twilioWhatsAppNumber || '+14155238886'; // Default sandbox

    // Normalize phone numbers - ensure they have + prefix and no whatsapp: prefix
    const normalizeForTwilio = (phone: string): string => {
      let normalized = phone.replace(/^whatsapp:/i, '').trim();
      if (!normalized.startsWith('+')) {
        normalized = '+' + normalized;
      }
      return `whatsapp:${normalized}`;
    };

    const toFormatted = normalizeForTwilio(to);
    const fromFormatted = normalizeForTwilio(fromRaw);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
      From: fromFormatted,
      To: toFormatted,
      Body: message,
    });

    if (mediaUrl) {
      body.append('MediaUrl', mediaUrl);
    }

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio API error:', data);
      return { success: false, error: data.message || 'Failed to send message' };
    }

    return { success: true, messageId: data.sid };
  } catch (error: any) {
    console.error('Error sending WhatsApp message via Twilio:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}

/**
 * Send WhatsApp message using Meta/WhatsApp Business API
 */
async function sendViaMeta(
  to: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const settings = await prisma.whatsAppSettings.findUnique({
      where: { provider: 'meta' },
    });

    if (!settings || !settings.isEnabled) {
      return { success: false, error: 'WhatsApp is not enabled' };
    }

    if (!settings.metaPhoneNumberId || !settings.metaAccessToken) {
      return { success: false, error: 'Meta credentials not configured' };
    }

    const phoneNumberId = settings.metaPhoneNumberId;
    const accessToken = decrypt(settings.metaAccessToken);

    // Remove + from phone number for Meta API
    const toFormatted = to.replace(/^\+/, '');

    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const messageBody: any = {
      messaging_product: 'whatsapp',
      to: toFormatted,
      type: 'text',
      text: { body: message },
    };

    if (mediaUrl) {
      messageBody.type = 'document';
      messageBody.document = {
        link: mediaUrl,
        filename: 'invoice.pdf',
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta API error:', data);
      return { success: false, error: data.error?.message || 'Failed to send message' };
    }

    return { success: true, messageId: data.messages[0]?.id };
  } catch (error: any) {
    console.error('Error sending WhatsApp message via Meta:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}

/**
 * Send WhatsApp message (auto-detects provider)
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // Get global settings to determine provider
    const settings = await prisma.whatsAppSettings.findFirst({
      where: { isEnabled: true },
    });

    if (!settings) {
      return { success: false, error: 'WhatsApp is not enabled' };
    }

    switch (settings.provider) {
      case 'twilio':
        return await sendViaTwilio(to, message, mediaUrl);
      case 'meta':
        return await sendViaMeta(to, message, mediaUrl);
      default:
        return { success: false, error: `Unsupported provider: ${settings.provider}` };
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}

/**
 * Send invoice PDF via WhatsApp
 */
export async function sendInvoiceViaWhatsApp(
  userId: string,
  invoiceId: string,
  recipientPhone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    });

    if (!invoice || invoice.userId !== userId) {
      return { success: false, error: 'Invoice not found' };
    }

    // Generate PDF URL (you'll need to implement PDF generation and storage)
    // For now, we'll use a placeholder approach
    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng'}/api/invoices/${invoiceId}/pdf`;

    // Format message
    const message = `📄 Invoice ${invoice.invoiceNumber}\n\n` +
      `Client: ${(invoice.clientInfo as any)?.name || 'N/A'}\n` +
      `Total: ${invoice.currency} ${invoice.total.toFixed(2)}\n` +
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n` +
      `View invoice: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng'}/invoice/${invoiceId}\n\n` +
      (invoice.paymentLink ? `Pay online: ${invoice.paymentLink}` : '');

    // Send message with PDF
    const result = await sendWhatsAppMessage(recipientPhone, message, pdfUrl);

    if (result.success) {
      // Log the message
      console.log(`✅ Invoice ${invoiceId} sent via WhatsApp to ${recipientPhone}`);
    }

    return result;
  } catch (error: any) {
    console.error('Error sending invoice via WhatsApp:', error);
    return { success: false, error: error.message || 'Failed to send invoice' };
  }
}

