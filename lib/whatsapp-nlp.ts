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
}

/**
 * Parse invoice creation command from WhatsApp message
 */
export function parseInvoiceCommand(message: string): ParsedInvoiceData {
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

