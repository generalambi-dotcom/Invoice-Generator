/**
 * API Client for making authenticated requests
 * This replaces localStorage calls with API calls
 */

import { getCurrentUser } from './auth';
import { getValidAccessToken } from './token-refresh';

// Use relative URLs for API calls (works in both dev and production)
const API_BASE = '';

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
 * Save invoice to database (creates new or updates existing)
 */
export async function saveInvoiceAPI(invoice: any): Promise<any> {
  try {
    const invoiceData = {
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
    };

    // If invoice has an ID, update it; otherwise create new
    const url = invoice.id 
      ? `${API_BASE}/api/invoices/${invoice.id}`
      : `${API_BASE}/api/invoices`;
    const method = invoice.id ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: await getAuthHeaders(),
      body: JSON.stringify(invoiceData),
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

/**
 * Get next invoice number
 */
export async function getNextInvoiceNumberAPI(
  prefix?: string,
  format?: string
): Promise<{ invoiceNumber: string; sequence: any }> {
  try {
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);
    if (format) params.append('format', format);

    const response = await fetch(
      `${API_BASE}/api/invoice-number/next?${params.toString()}`,
      {
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to generate invoice number');
      }
      throw new Error(error.error || 'Failed to generate invoice number');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
}

/**
 * Update invoice number sequence settings
 */
export async function updateInvoiceNumberSequenceAPI(settings: {
  prefix: string;
  format: string;
  resetPeriod?: 'year' | 'month' | null;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoice-number/next`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to update invoice number settings');
      }
      throw new Error(error.error || 'Failed to update invoice number settings');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating invoice number settings:', error);
    throw error;
  }
}

/**
 * Get all clients
 */
export async function getClientsAPI(search?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await fetch(
      `${API_BASE}/api/clients?${params.toString()}`,
      {
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to view clients');
      }
      throw new Error(error.error || 'Failed to load clients');
    }

    const data = await response.json();
    return data.clients || [];
  } catch (error: any) {
    console.error('Error loading clients:', error);
    throw error;
  }
}

/**
 * Get single client
 */
export async function getClientAPI(clientId: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}/api/clients/${clientId}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.json();
      throw new Error(error.error || 'Failed to load client');
    }

    const data = await response.json();
    return data.client;
  } catch (error: any) {
    console.error('Error loading client:', error);
    throw error;
  }
}

/**
 * Create client
 */
export async function createClientAPI(client: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/clients`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create client';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to create client');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.client;
  } catch (error: any) {
    console.error('Error creating client:', error);
    // If it's already an Error object, throw it as-is
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise wrap it
    throw new Error(error.message || 'Failed to create client');
  }
}

/**
 * Update client
 */
export async function updateClientAPI(clientId: string, client: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to update client');
      }
      throw new Error(error.error || 'Failed to update client');
    }

    const data = await response.json();
    return data.client;
  } catch (error: any) {
    console.error('Error updating client:', error);
    throw error;
  }
}

/**
 * Delete client
 */
export async function deleteClientAPI(clientId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/clients/${clientId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to delete client');
      }
      throw new Error(error.error || 'Failed to delete client');
    }
  } catch (error: any) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

/**
 * Update overdue invoices
 */
export async function updateOverdueInvoicesAPI(): Promise<{ count: number }> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/update-overdue`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update overdue invoices');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating overdue invoices:', error);
    throw error;
  }
}

/**
 * Get revenue report
 */
export async function getRevenueReportAPI(params: {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(
      `${API_BASE}/api/reports/revenue?${queryParams.toString()}`,
      {
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load revenue report');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading revenue report:', error);
    throw error;
  }
}

/**
 * Get outstanding invoices report
 */
export async function getOutstandingReportAPI(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/reports/outstanding`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load outstanding report');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading outstanding report:', error);
    throw error;
  }
}

/**
 * Get client payment history report
 */
export async function getClientPaymentHistoryAPI(clientId?: string): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (clientId) queryParams.append('clientId', clientId);

    const response = await fetch(
      `${API_BASE}/api/reports/client-payment-history?${queryParams.toString()}`,
      {
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load client payment history');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading client payment history:', error);
    throw error;
  }
}

/**
 * Get tax report
 */
export async function getTaxReportAPI(params: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'month' | 'quarter' | 'year';
}): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const response = await fetch(
      `${API_BASE}/api/reports/tax?${queryParams.toString()}`,
      {
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load tax report');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading tax report:', error);
    throw error;
  }
}

/**
 * Export report to CSV
 */
export async function exportReportAPI(
  reportType: string,
  data: any[],
  filename?: string
): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE}/api/reports/export`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        reportType,
        data,
        filename: filename || `${reportType}-${new Date().toISOString().split('T')[0]}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to export report');
    }

    return await response.blob();
  } catch (error: any) {
    console.error('Error exporting report:', error);
    throw error;
  }
}

/**
 * Get payment history for an invoice
 */
export async function getInvoicePaymentHistoryAPI(invoiceId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/payments`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load payment history');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading payment history:', error);
    throw error;
  }
}

/**
 * Record manual payment
 */
export async function recordPaymentAPI(
  invoiceId: string,
  amount: number,
  currency: string,
  notes?: string
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ amount, currency, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to record payment');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Get payment reminders
 */
export async function getPaymentRemindersAPI(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/payment-reminders`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load payment reminders');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading payment reminders:', error);
    throw error;
  }
}

/**
 * Get available payment providers
 */
export async function getAvailablePaymentProvidersAPI(): Promise<{ providers: any[]; defaultProvider: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/api/payment-providers/available`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to view payment providers');
      }
      throw new Error(error.error || 'Failed to load payment providers');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading payment providers:', error);
    throw error;
  }
}

/**
 * Update default payment provider
 */
export async function updateDefaultPaymentProviderAPI(provider: 'paypal' | 'paystack' | 'stripe' | null): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/company-defaults/default-payment-provider`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ defaultPaymentProvider: provider }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to update default payment provider');
      }
      throw new Error(error.error || 'Failed to update default payment provider');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating default payment provider:', error);
    throw error;
  }
}

// ===== Invoice Approval Workflow =====

/**
 * Approve an invoice
 */
export async function approveInvoiceAPI(invoiceId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/approve`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to approve invoices');
      }
      throw new Error(error.error || 'Failed to approve invoice');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error approving invoice:', error);
    throw error;
  }
}

/**
 * Reject an invoice
 */
export async function rejectInvoiceAPI(invoiceId: string, reason?: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/reject`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to reject invoices');
      }
      throw new Error(error.error || 'Failed to reject invoice');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error rejecting invoice:', error);
    throw error;
  }
}

/**
 * Request approval for an invoice
 */
export async function requestApprovalAPI(invoiceId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/request-approval`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to request approval');
      }
      throw new Error(error.error || 'Failed to request approval');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error requesting approval:', error);
    throw error;
  }
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceSentAPI(invoiceId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/send`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to mark invoice as sent');
      }
      throw new Error(error.error || 'Failed to mark invoice as sent');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error marking invoice as sent:', error);
    throw error;
  }
}

// ===== Credit Notes =====

/**
 * Get credit notes
 */
export async function getCreditNotesAPI(invoiceId?: string, status?: string): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (invoiceId) params.append('invoiceId', invoiceId);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE}/api/credit-notes?${params.toString()}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to view credit notes');
      }
      throw new Error(error.error || 'Failed to load credit notes');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading credit notes:', error);
    throw error;
  }
}

/**
 * Get a single credit note
 */
export async function getCreditNoteAPI(creditNoteId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/credit-notes/${creditNoteId}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to view credit note');
      }
      throw new Error(error.error || 'Failed to load credit note');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error loading credit note:', error);
    throw error;
  }
}

/**
 * Create a credit note
 */
export async function createCreditNoteAPI(creditNote: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/credit-notes`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(creditNote),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to create credit notes');
      }
      throw new Error(error.error || 'Failed to create credit note');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating credit note:', error);
    throw error;
  }
}

/**
 * Update a credit note
 */
export async function updateCreditNoteAPI(creditNoteId: string, creditNote: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/credit-notes/${creditNoteId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(creditNote),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to update credit notes');
      }
      throw new Error(error.error || 'Failed to update credit note');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating credit note:', error);
    throw error;
  }
}

/**
 * Delete a credit note
 */
export async function deleteCreditNoteAPI(creditNoteId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/credit-notes/${creditNoteId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to delete credit notes');
      }
      throw new Error(error.error || 'Failed to delete credit note');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error deleting credit note:', error);
    throw error;
  }
}

/**
 * Apply a credit note to an invoice
 */
export async function applyCreditNoteAPI(creditNoteId: string, invoiceId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/credit-notes/${creditNoteId}/apply`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ invoiceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to apply credit notes');
      }
      throw new Error(error.error || 'Failed to apply credit note');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error applying credit note:', error);
    throw error;
  }
}

/**
 * Send payment reminders
 */
export async function sendPaymentRemindersAPI(
  invoiceIds: string[],
  message?: string
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/payment-reminders`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ invoiceIds, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send payment reminders');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error sending payment reminders:', error);
    throw error;
  }
}

/**
 * Generate edit token for customer invoice editing
 */
export async function generateInvoiceEditTokenAPI(invoiceId: string): Promise<{ token: string; editUrl: string; expiresAt: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/generate-edit-token`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Please sign in to generate edit link');
      }
      const error = await response.json().catch(() => ({ error: 'Failed to generate edit token' }));
      throw new Error(error.error || 'Failed to generate edit token');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating edit token:', error);
    throw error;
  }
}

