import { LineItem } from '@/types/invoice';

/**
 * Calculate the subtotal from line items
 */
export function calculateSubtotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => {
    const amount = item.quantity * item.rate;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
}

/**
 * Calculate tax amount from subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  if (isNaN(subtotal) || isNaN(taxRate) || taxRate < 0) {
    return 0;
  }
  return Math.round((subtotal * taxRate) / 100 * 100) / 100;
}

/**
 * Calculate discount amount from subtotal and discount rate
 */
export function calculateDiscount(subtotal: number, discountRate: number): number {
  if (isNaN(subtotal) || isNaN(discountRate) || discountRate < 0) {
    return 0;
  }
  return Math.round((subtotal * discountRate) / 100 * 100) / 100;
}

/**
 * Calculate the final total
 */
export function calculateTotal(
  subtotal: number,
  taxAmount: number,
  discountAmount: number,
  shipping: number
): number {
  const subtotalNum = isNaN(subtotal) ? 0 : subtotal;
  const taxNum = isNaN(taxAmount) ? 0 : taxAmount;
  const discountNum = isNaN(discountAmount) ? 0 : discountAmount;
  const shippingNum = isNaN(shipping) ? 0 : shipping;

  const total = subtotalNum + taxNum - discountNum + shippingNum;
  return Math.round(total * 100) / 100;
}

/**
 * Format currency value based on currency type
 */
export function formatCurrency(amount: number, currency: string): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00';
  }

  try {
    // Special handling for JPY (no decimals)
    if (currency === 'JPY') {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }

    // Standard formatting for other currencies (2 decimal places with thousands separators)
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl fails
    return Math.abs(amount).toFixed(2);
  }
}

