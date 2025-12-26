import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseInvoiceCommand, validateParsedInvoice } from '@/lib/whatsapp-nlp';
import { sendWhatsAppMessage } from '@/lib/whatsapp-sender';
import { saveInvoiceAPI } from '@/lib/api-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Normalize phone number to consistent format (+country code + number)
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove whatsapp: prefix if present
  let normalized = phone.replace(/^whatsapp:/i, '').trim();
  
  // Remove any spaces, dashes, or other formatting
  normalized = normalized.replace(/[\s\-\(\)]/g, '');
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // If it starts with 0, replace with country code (UK = +44)
    if (normalized.startsWith('0')) {
      normalized = '+44' + normalized.substring(1);
    } else {
      normalized = '+' + normalized;
    }
  }
  
  return normalized;
}

/**
 * POST - Handle incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle Twilio webhook format
    if (body.From && body.Body) {
      return await handleTwilioWebhook(body);
    }

    // Handle Meta webhook format
    if (body.entry && body.entry[0]?.changes) {
      return await handleMetaWebhook(body);
    }

    return NextResponse.json({ error: 'Unknown webhook format' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing WhatsApp webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * Handle Twilio webhook
 */
async function handleTwilioWebhook(body: any) {
  // Log full webhook payload for debugging
  console.log('🔍 Twilio webhook received:', {
    From: body.From,
    To: body.To,
    Body: body.Body,
    MessageSid: body.MessageSid,
    AccountSid: body.AccountSid,
  });

  // Normalize the phone number from Twilio
  const fromRaw = body.From || '';
  const from = normalizePhoneNumber(fromRaw);
  const message = body.Body;

  console.log(`📱 WhatsApp message from ${fromRaw} (normalized: ${from}): ${message}`);

  // Find user by phone number (try exact match first)
  let credential = await prisma.whatsAppCredential.findFirst({
    where: {
      phoneNumber: from,
      isActive: true,
    },
    include: { user: true },
  });

  // If not found, try variations (with/without +, with/without country code)
  if (!credential) {
    const fromWithoutPlus = from.startsWith('+') ? from.substring(1) : from;
    const variations = [
      from,
      `+${fromWithoutPlus}`,
      fromWithoutPlus,
      fromRaw.replace('whatsapp:', '').trim(),
    ];

    console.log(`🔍 Trying phone number variations:`, variations);

    credential = await prisma.whatsAppCredential.findFirst({
      where: {
        OR: variations.map(v => ({ phoneNumber: v })),
        isActive: true,
      },
      include: { user: true },
    });
  }

  if (!credential) {
    console.log(`⚠️ No WhatsApp credential found for ${from} (raw: ${fromRaw})`);
    // Log all active credentials for debugging
    const allCredentials = await prisma.whatsAppCredential.findMany({
      where: { isActive: true },
      select: { phoneNumber: true, userId: true, isVerified: true },
    });
    console.log('📋 Active credentials in database:', allCredentials);
    return NextResponse.json({ message: 'Not connected' }, { status: 200 });
  }

  console.log(`✅ Found credential for ${credential.phoneNumber} (user: ${credential.userId})`);

  // Mark as verified if not already
  if (!credential.isVerified) {
    await prisma.whatsAppCredential.update({
      where: { id: credential.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        lastMessageAt: new Date(),
      },
    });
  } else {
    await prisma.whatsAppCredential.update({
      where: { id: credential.id },
      data: { lastMessageAt: new Date() },
    });
  }

  // Check if message is an invoice creation command
  const lowerMessage = message.toLowerCase().trim();
  const isInvoiceCommand = 
    lowerMessage.includes('create invoice') ||
    lowerMessage.includes('new invoice') ||
    lowerMessage.includes('invoice for') ||
    lowerMessage.includes('bill to') ||
    (lowerMessage.includes('client') && lowerMessage.includes('$'));

  if (isInvoiceCommand) {
    return await handleInvoiceCreation(credential.userId, message, from);
  }

  // Default: send help message
  const helpMessage = `👋 Hello! I can help you create invoices via WhatsApp.\n\n` +
    `📝 To create an invoice, send a message like:\n` +
    `"Create invoice for John Doe, 5 items at $100 each, due in 30 days"\n\n` +
    `Or:\n` +
    `"Invoice: Client: ABC Company, Items: Web Design $500, Development $1000"\n\n` +
    `💡 Tips:\n` +
    `- Include client name\n` +
    `- List items with quantities and prices\n` +
    `- Specify due date if needed`;

  await sendWhatsAppMessage(from, helpMessage);

  return NextResponse.json({ message: 'Help sent' }, { status: 200 });
}

/**
 * Handle Meta webhook
 */
async function handleMetaWebhook(body: any) {
  // Log full webhook payload for debugging
  console.log('🔍 Meta webhook received:', JSON.stringify(body, null, 2));

  const entry = body.entry[0];
  const change = entry.changes[0];
  const value = change.value;

  if (!value.messages || value.messages.length === 0) {
    return NextResponse.json({ message: 'No messages' }, { status: 200 });
  }

  const message = value.messages[0];
  const fromRaw = message.from;
  const from = normalizePhoneNumber(`+${fromRaw}`);
  const text = message.text?.body || '';

  console.log(`📱 WhatsApp message from ${fromRaw} (normalized: ${from}): ${text}`);

  // Find user by phone number (try exact match first)
  let credential = await prisma.whatsAppCredential.findFirst({
    where: {
      phoneNumber: from,
      isActive: true,
    },
    include: { user: true },
  });

  // If not found, try variations
  if (!credential) {
    const fromWithoutPlus = from.startsWith('+') ? from.substring(1) : from;
    const variations = [
      from,
      `+${fromWithoutPlus}`,
      fromWithoutPlus,
      `+${fromRaw}`,
      fromRaw,
    ];

    console.log(`🔍 Trying phone number variations:`, variations);

    credential = await prisma.whatsAppCredential.findFirst({
      where: {
        OR: variations.map(v => ({ phoneNumber: v })),
        isActive: true,
      },
      include: { user: true },
    });
  }

  if (!credential) {
    console.log(`⚠️ No WhatsApp credential found for ${from} (raw: ${fromRaw})`);
    // Log all active credentials for debugging
    const allCredentials = await prisma.whatsAppCredential.findMany({
      where: { isActive: true },
      select: { phoneNumber: true, userId: true, isVerified: true },
    });
    console.log('📋 Active credentials in database:', allCredentials);
    return NextResponse.json({ message: 'Not connected' }, { status: 200 });
  }

  console.log(`✅ Found credential for ${credential.phoneNumber} (user: ${credential.userId})`);

  // Similar handling as Twilio
  const lowerMessage = text.toLowerCase().trim();
  const isInvoiceCommand = 
    lowerMessage.includes('create invoice') ||
    lowerMessage.includes('new invoice') ||
    lowerMessage.includes('invoice for') ||
    lowerMessage.includes('bill to') ||
    (lowerMessage.includes('client') && lowerMessage.includes('$'));

  if (isInvoiceCommand) {
    return await handleInvoiceCreation(credential.userId, text, from);
  }

  const helpMessage = `👋 Hello! I can help you create invoices via WhatsApp.\n\n` +
    `📝 To create an invoice, send a message like:\n` +
    `"Create invoice for John Doe, 5 items at $100 each, due in 30 days"`;

  await sendWhatsAppMessage(from, helpMessage);

  return NextResponse.json({ message: 'Help sent' }, { status: 200 });
}

/**
 * Handle invoice creation from WhatsApp message
 */
async function handleInvoiceCreation(userId: string, message: string, from: string) {
  try {
    // Parse invoice data from message
    const parsedData = parseInvoiceCommand(message);
    const validation = validateParsedInvoice(parsedData);

    if (!validation.valid) {
      const errorMessage = `❌ Invoice creation failed:\n\n${validation.errors.join('\n')}\n\n` +
        `Please provide all required information.`;
      await sendWhatsAppMessage(from, errorMessage);
      return NextResponse.json({ message: 'Validation failed' }, { status: 200 });
    }

    // Get user's company defaults
    const defaults = await prisma.companyDefaults.findUnique({
      where: { userId },
    });

    if (!defaults) {
      await sendWhatsAppMessage(
        from,
        '❌ Please set up your company information first in the web dashboard.'
      );
      return NextResponse.json({ message: 'No company defaults' }, { status: 200 });
    }

    // Calculate totals
    const items = parsedData.items || [];
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate);
    }, 0);

    const taxRate = parsedData.taxRate || 0;
    const discountRate = parsedData.discountRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = (subtotal * discountRate) / 100;
    const total = subtotal - discountAmount + taxAmount;

    // Generate invoice number
    const sequence = await prisma.invoiceNumberSequence.findFirst({
      where: { userId },
    });

    let invoiceNumber = `INV-${Date.now()}`;
    if (sequence) {
      // Use sequence logic (simplified for now)
      invoiceNumber = `${sequence.prefix}-${new Date().getFullYear()}-${String(sequence.currentNumber).padStart(4, '0')}`;
      await prisma.invoiceNumberSequence.update({
        where: { id: sequence.id },
        data: { currentNumber: sequence.currentNumber + 1 },
      });
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber,
        invoiceDate: new Date(),
        dueDate: parsedData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        companyInfo: defaults.companyInfo as any,
        clientInfo: {
          name: parsedData.clientName || 'Client',
          email: parsedData.clientEmail || null,
          phone: parsedData.clientPhone || null,
        } as any,
        lineItems: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })) as any,
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        shipping: 0,
        total,
        currency: parsedData.currency || defaults.defaultCurrency || 'USD',
        theme: defaults.defaultTheme || 'slate',
        notes: parsedData.notes || null,
        paymentStatus: 'pending',
        createdBy: 'owner',
      },
    });

    console.log(`✅ Invoice created via WhatsApp: ${invoice.id} for user ${userId}`);

    // Send confirmation message
    const confirmationMessage = `✅ Invoice Created!\n\n` +
      `Invoice #: ${invoice.invoiceNumber}\n` +
      `Client: ${parsedData.clientName || 'Client'}\n` +
      `Total: ${invoice.currency} ${total.toFixed(2)}\n` +
      `Due: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n` +
      `View: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng'}/?invoiceId=${invoice.id}\n\n` +
      `Sending PDF...`;

    await sendWhatsAppMessage(from, confirmationMessage);

    // Send PDF (you'll need to implement PDF generation and upload)
    // For now, just send the link
    const pdfMessage = `📄 Invoice PDF:\n${process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng'}/api/invoices/${invoice.id}/pdf`;
    await sendWhatsAppMessage(from, pdfMessage);

    return NextResponse.json({ message: 'Invoice created' }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating invoice from WhatsApp:', error);
    await sendWhatsAppMessage(
      from,
      '❌ Sorry, there was an error creating your invoice. Please try again or use the web dashboard.'
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET - Webhook verification (for Meta)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook (you should store verify_token in settings)
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return NextResponse.json(parseInt(challenge || '0'), { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

