/**
 * API Client for making authenticated requests
 * This replaces localStorage calls with API calls
 */

import { getCurrentUser } from './auth';
import { getValidAccessToken } from './token-refresh';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || '';

/**
 * Get authentication headers with JWT token
 * Automatically refreshes token if needed
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }

  const token = await getValidAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Save invoice to database
 */
export async function saveInvoiceAPI(invoice: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        purchaseOrder: invoice.purchaseOrder,
        companyInfo: invoice.company,
        clientInfo: invoice.client,
        shipToInfo: invoice.shipTo,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        discountRate: invoice.discountRate,
        discountAmount: invoice.discountAmount,
        shipping: invoice.shipping,
        total: invoice.total,
        currency: invoice.currency,
        theme: invoice.theme,
        notes: invoice.notes,
        bankDetails: invoice.bankDetails,
        terms: invoice.terms,
        paymentStatus: invoice.paymentStatus || 'pending',
        paymentLink: invoice.paymentLink,
        paymentProvider: invoice.paymentProvider,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save invoice');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error saving invoice:', error);
    throw error;
  }
}

/**
 * Load invoices from database
 */
export async function loadInvoicesAPI(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to view invoices');
      }
      const error = await response.json().catch(() => ({ error: 'Failed to load invoices' }));
      throw new Error(error.error || 'Failed to load invoices');
    }

    const data = await response.json();
    return data.invoices || [];
  } catch (error: any) {
    console.error('Error loading invoices:', error);
    throw error;
  }
}

/**
 * Load single invoice
 */
export async function loadInvoiceAPI(invoiceId: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.invoice;
  } catch (error) {
    console.error('Error loading invoice:', error);
    return null;
  }
}

/**
 * Delete invoice
 */
export async function deleteInvoiceAPI(invoiceId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

/**
 * Generate payment link for invoice
 */
export async function generatePaymentLinkAPI(
  invoiceId: string,
  provider: 'paypal' | 'paystack' | 'stripe'
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/payment-link`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ provider }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate payment link' }));
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to generate payment links');
      }
      if (response.status === 400) {
        throw new Error(error.error || 'Invalid payment provider or missing credentials');
      }
      throw new Error(error.error || 'Failed to generate payment link');
    }

    const data = await response.json();
    return data.paymentLink;
  } catch (error: any) {
    console.error('Error generating payment link:', error);
    throw error;
  }
}

/**
 * Send invoice via email
 */
export async function sendInvoiceEmailAPI(
  invoiceId: string,
  recipientEmail: string,
  message?: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/send-email`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        invoiceId,
        recipientEmail,
        message: message || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to send email' }));
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to send invoices');
      }
      if (response.status === 400) {
        throw new Error(error.error || 'Invalid email address or missing invoice');
      }
      if (response.status === 404) {
        throw new Error('Invoice not found');
      }
      throw new Error(error.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Get company defaults from database
 */
export async function getCompanyDefaultsAPI(): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}/api/company-defaults`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to view company defaults');
      }
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({ error: 'Failed to load company defaults' }));
      throw new Error(error.error || 'Failed to load company defaults');
    }

    const data = await response.json();
    return data.defaults;
  } catch (error: any) {
    console.error('Error loading company defaults:', error);
    throw error;
  }
}

/**
 * Save company defaults to database
 */
export async function saveCompanyDefaultsAPI(defaults: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/company-defaults`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(defaults),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to save company defaults');
      }
      throw new Error(error.error || 'Failed to save company defaults');
    }

    const data = await response.json();
    return data.defaults;
  } catch (error: any) {
    console.error('Error saving company defaults:', error);
    throw error;
  }
}

/**
 * Delete company defaults
 */
export async function deleteCompanyDefaultsAPI(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/company-defaults`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to delete company defaults');
      }
      throw new Error(error.error || 'Failed to delete company defaults');
    }
  } catch (error: any) {
    console.error('Error deleting company defaults:', error);
    throw error;
  }
}

