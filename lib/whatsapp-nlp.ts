import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { parseInvoiceWithLLM } from './llm/providers';
import { LLMConfig, LLMProvider } from './llm/types';
import { getSmartContext } from './llm/context';

/**
 * Natural Language Processing for WhatsApp Invoice Creation
 * Parses user messages to extract invoice information
 */

export interface ParsedInvoiceData {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount?: number;
  }>;
  dueDate?: Date;
  taxRate?: number;
  discountRate?: number;
  notes?: string;
  currency?: string;
  assistantMessage?: string;
}

/**
 * Parse invoice creation command from WhatsApp message
 * Tries LLM first if enabled, falls back to Regex
 */
export async function parseInvoiceCommand(message: string, userId?: string): Promise<ParsedInvoiceData> {
  try {
    // 1. Check if LLM is enabled
    const settings = await prisma.lLMSettings.findFirst({
      where: { isEnabled: true }
    });

    if (settings && settings.apiKey) {
      console.log(`🤖 Using AI Model: ${settings.provider} (${settings.model})`);

      const config: LLMConfig = {
        provider: settings.provider as LLMProvider,
        apiKey: decrypt(settings.apiKey),
        model: settings.model || 'gpt-4o',
        useSmartContext: settings.useSmartContext
      };

      // Fetch context if enabled and userId is provided
      let context = '';
      if (config.useSmartContext && userId) {
        console.log('🧠 Fetching Smart Context...');
        context = await getSmartContext(userId);
      }

      const fullMessage = context ? `${context}\n\nUSER REQUEST: ${message}` : message;
      const result = await parseInvoiceWithLLM(config, fullMessage);

      if (result.success && result.data) {
        // Return if we have items OR an assistant message (AI answered a question)
        if ((result.data.items && result.data.items.length > 0) || result.data.assistantMessage) {
          return result.data;
        }
        console.log('⚠️ AI returned empty items and no message, falling back to Regex');
      } else {
        console.error('❌ AI Parsing failed:', result.error);
      }
    }
  } catch (error) {
    console.error('❌ Error in AI parsing:', error);
  }

  // 2. Fallback to Regex
  console.log('⚡ Using Regex Parser');
  return parseInvoiceCommandRegex(message);
}

/**
 * Regex-based parser (Fallback)
 */
export function parseInvoiceCommandRegex(message: string): ParsedInvoiceData {
  const data: ParsedInvoiceData = {};
  const lowerMessage = message.toLowerCase().trim();

  // Extract client name
  const clientNameMatch = message.match(/(?:client|customer|to|for|bill to)[\s:]+([A-Za-z\s]+?)(?:,|$|\n|invoice|items|amount|total)/i);
  if (clientNameMatch) {
    data.clientName = clientNameMatch[1].trim();
  }

  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    data.clientEmail = emailMatch[1];
  }

  // Extract phone number
  const phoneMatch = message.match(/(\+?[1-9]\d{1,14}|\d{10,15})/);
  if (phoneMatch && !phoneMatch[0].includes('@')) {
    data.clientPhone = phoneMatch[0];
  }

  // Extract items - look for patterns like:
  // "5 items at $100 each"
  // "3 hours consulting at $150/hour"
  // "Web Design $500, Development $1000"
  const items: Array<{ description: string; quantity: number; rate: number }> = [];

  // Pattern 1: "X items at $Y each"
  const itemsPattern1 = message.match(/(\d+)\s+(?:items?|units?|hours?|days?)\s+(?:at|@)\s*\$?(\d+(?:\.\d+)?)/gi);
  if (itemsPattern1) {
    itemsPattern1.forEach(match => {
      const parts = match.match(/(\d+)\s+(?:items?|units?|hours?|days?)\s+(?:at|@)\s*\$?(\d+(?:\.\d+)?)/i);
      if (parts) {
        items.push({
          description: `Item ${items.length + 1}`,
          quantity: parseInt(parts[1]),
          rate: parseFloat(parts[2]),
        });
      }
    });
  }

  // Pattern 2: "Description $amount" or "Description: $amount"
  const itemsPattern2 = message.match(/([A-Za-z\s]+?)[\s:]+?\$?(\d+(?:\.\d+)?)/g);
  if (itemsPattern2 && items.length === 0) {
    itemsPattern2.forEach(match => {
      const parts = match.match(/([A-Za-z\s]+?)[\s:]+?\$?(\d+(?:\.\d+)?)/);
      if (parts && !parts[1].toLowerCase().includes('total') && !parts[1].toLowerCase().includes('subtotal')) {
        items.push({
          description: parts[1].trim(),
          quantity: 1,
          rate: parseFloat(parts[2]),
        });
      }
    });
  }

  // Pattern 3: "X of Y at $Z" or "X Y at $Z"
  const itemsPattern3 = message.match(/(\d+)\s+(?:of\s+)?([A-Za-z\s]+?)\s+(?:at|@)\s*\$?(\d+(?:\.\d+)?)/gi);
  if (itemsPattern3 && items.length === 0) {
    itemsPattern3.forEach(match => {
      const parts = match.match(/(\d+)\s+(?:of\s+)?([A-Za-z\s]+?)\s+(?:at|@)\s*\$?(\d+(?:\.\d+)?)/i);
      if (parts) {
        items.push({
          description: parts[2].trim(),
          quantity: parseInt(parts[1]),
          rate: parseFloat(parts[3]),
        });
      }
    });
  }

  if (items.length > 0) {
    data.items = items;
  }

  // Extract due date
  const dueDateMatch = message.match(/(?:due|payment due|pay by)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d+\s+(?:days?|weeks?|months?))/i);
  if (dueDateMatch) {
    const dateStr = dueDateMatch[1];
    if (dateStr.includes('day') || dateStr.includes('week') || dateStr.includes('month')) {
      const daysMatch = dateStr.match(/(\d+)\s+days?/i);
      const weeksMatch = dateStr.match(/(\d+)\s+weeks?/i);
      const monthsMatch = dateStr.match(/(\d+)\s+months?/i);

      const days = daysMatch ? parseInt(daysMatch[1]) :
        weeksMatch ? parseInt(weeksMatch[1]) * 7 :
          monthsMatch ? parseInt(monthsMatch[1]) * 30 : 30;

      data.dueDate = new Date();
      data.dueDate.setDate(data.dueDate.getDate() + days);
    } else {
      // Try to parse date string
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        data.dueDate = parsed;
      }
    }
  }

  // Extract tax rate
  const taxMatch = message.match(/(?:tax|vat)[\s:]+(\d+(?:\.\d+)?)%?/i);
  if (taxMatch) {
    data.taxRate = parseFloat(taxMatch[1]);
  }

  // Extract discount
  const discountMatch = message.match(/(?:discount|off)[\s:]+(\d+(?:\.\d+)?)%?/i);
  if (discountMatch) {
    data.discountRate = parseFloat(discountMatch[1]);
  }

  // Extract currency
  const currencyMatch = message.match(/\$|€|£|¥|₦|usd|eur|gbp|jpy|ngn|cad|aud/i);
  if (currencyMatch) {
    const currencyMap: Record<string, string> = {
      '$': 'USD',
      'usd': 'USD',
      '€': 'EUR',
      'eur': 'EUR',
      '£': 'GBP',
      'gbp': 'GBP',
      '¥': 'JPY',
      'jpy': 'JPY',
      '₦': 'NGN',
      'ngn': 'NGN',
      'cad': 'CAD',
      'aud': 'AUD',
    };
    data.currency = currencyMap[currencyMatch[0].toLowerCase()] || 'USD';
  }

  // Extract notes (anything after "notes:" or "note:")
  const notesMatch = message.match(/(?:notes?|remarks?)[\s:]+(.+)/i);
  if (notesMatch) {
    data.notes = notesMatch[1].trim();
  }

  return data;
}

/**
 * Validate parsed invoice data
 */
export function validateParsedInvoice(data: ParsedInvoiceData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.clientName && !data.clientEmail) {
    errors.push('Client name or email is required');
  }

  if (!data.items || data.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.rate < 0) {
        errors.push(`Item ${index + 1}: Rate must be positive`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ─── Client Reply Classification ──────────────────────────────────────────────

export type ClientReplyIntent =
  | 'payment_confirmation' // "I've paid" / "sent money"
  | 'resend_request'       // "resend" / "didn't receive"
  | 'payment_query'        // "can I pay later?" / "installments?"
  | 'dispute'              // "wrong amount" / "I disagree"
  | 'general_reply';       // anything else

/**
 * Classify an inbound WhatsApp message from a client into one of the known intents.
 * Used to decide how to auto-reply and what to tell the invoice owner.
 */
export function classifyClientReply(message: string): ClientReplyIntent {
  const m = message.toLowerCase().trim();

  if (/\b(paid|i.?ve paid|payment sent|transferred|sent the money|already paid|i paid|done paying|payment made|completed payment)\b/.test(m)) {
    return 'payment_confirmation';
  }

  if (/\b(resend|send again|didn.?t receive|not received|haven.?t received|missing invoice|re-?send|pls send|please send|where is|where.?s my invoice)\b/.test(m)) {
    return 'resend_request';
  }

  if (/\b(extension|more time|pay later|installment|part payment|partial|when (do|can|should) i pay|how (do|can) i pay|payment plan|two weeks|next month)\b/.test(m)) {
    return 'payment_query';
  }

  if (/\b(wrong (amount|total|price)|dispute|not correct|incorrect|error|mistake|overcharged|charge too much|disagree)\b/.test(m)) {
    return 'dispute';
  }

  return 'general_reply';
}

/**
 * Build the auto-reply message sent back to the client on WhatsApp.
 */
export function buildClientAutoReply(
  intent: ClientReplyIntent,
  invoiceNumber: string,
  baseUrl: string,
  invoiceId: string,
): string {
  switch (intent) {
    case 'payment_confirmation':
      return (
        `✅ Thank you! We've received your payment confirmation for Invoice *${invoiceNumber}*.\n\n` +
        `We'll update the invoice status shortly. You'll hear back from the sender soon.`
      );
    case 'resend_request':
      return (
        `📄 No problem! Here's your invoice link:\n` +
        `${baseUrl}/invoice/${invoiceId}\n\n` +
        `You can view and download the PDF directly from that link.`
      );
    case 'payment_query':
      return (
        `💬 Thanks for reaching out about Invoice *${invoiceNumber}*.\n\n` +
        `We've notified the sender of your message. They'll get back to you shortly to discuss payment arrangements.`
      );
    case 'dispute':
      return (
        `⚠️ We're sorry to hear there may be an issue with Invoice *${invoiceNumber}*.\n\n` +
        `We've flagged this for the sender who will review and respond to you shortly.`
      );
    default:
      return (
        `💬 Thank you for your message! We've forwarded it to the sender.\n\n` +
        `They'll get back to you as soon as possible.`
      );
  }
}

/**
 * Human-readable label for each intent (used in notification emails).
 */
export function intentLabel(intent: ClientReplyIntent): string {
  switch (intent) {
    case 'payment_confirmation': return '💰 Payment Confirmation';
    case 'resend_request':       return '📄 Resend Request';
    case 'payment_query':        return '🗓 Payment Query / Extension';
    case 'dispute':              return '⚠️ Invoice Dispute';
    default:                     return '💬 General Reply';
  }
}

/**
 * Generate a helpful response message for incomplete invoice data
 */
export function generateHelpMessage(missingFields: string[]): string {
  if (missingFields.length === 0) {
    return '✅ All required information provided!';
  }

  let message = '⚠️ Missing information:\n';
  missingFields.forEach(field => {
    message += `- ${field}\n`;
  });
  message += '\nPlease provide the missing details.';
  return message;
}

