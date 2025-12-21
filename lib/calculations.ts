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
  if (isNaN(amount)) {
    return '0.00';
  }

  const formatted = Math.abs(amount).toFixed(2);

  switch (currency) {
    case 'JPY':
      // Japanese Yen doesn't use decimal places
      return Math.round(amount).toString();
    case 'GBP':
    case 'USD':
    case 'EUR':
    case 'CAD':
    case 'AUD':
    case 'NGN':
    default:
      return formatted;
  }
}

