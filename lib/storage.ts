import { Invoice, CompanyDefaults } from '@/types/invoice';
import { getCurrentUser } from './auth';

const INVOICES_KEY = 'invoice-generator-invoices';
const DELETED_INVOICES_KEY = 'invoice-generator-deleted-invoices';
const COMPANY_DEFAULTS_KEY = 'invoice-generator-company-defaults';

function getUserKey(baseKey: string): string {
  const user = getCurrentUser();
  if (user) {
    return `${baseKey}-${user.id}`;
  }
  return baseKey;
}

/**
 * Save an invoice to localStorage
 */
export function saveInvoice(invoice: Invoice): void {
  try {
    const invoices = loadInvoices();
    const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id);

    if (existingIndex >= 0) {
      // Update existing invoice
      invoices[existingIndex] = {
        ...invoice,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new invoice
      invoices.push({
        ...invoice,
        createdAt: invoice.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(getUserKey(INVOICES_KEY), JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw new Error('Failed to save invoice');
  }
}

/**
 * Load all invoices from localStorage
 */
export function loadInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(getUserKey(INVOICES_KEY));
    if (!data) {
      return [];
    }
    return JSON.parse(data) as Invoice[];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
}

/**
 * Load a specific invoice by ID
 */
export function loadInvoice(id: string): Invoice | null {
  try {
    const invoices = loadInvoices();
    return invoices.find((inv) => inv.id === id) || null;
  } catch (error) {
    console.error('Error loading invoice:', error);
    return null;
  }
}

/**
 * Delete an invoice from localStorage
 */
export function deleteInvoice(id: string): void {
  try {
    const invoices = loadInvoices();
    const invoiceToDelete = invoices.find((inv) => inv.id === id);
    
    if (invoiceToDelete) {
      // Move to deleted invoices
      const deletedInvoices = loadDeletedInvoices();
      deletedInvoices.push({
        ...invoiceToDelete,
        deletedAt: new Date().toISOString(),
      } as Invoice & { deletedAt: string });
      localStorage.setItem(getUserKey(DELETED_INVOICES_KEY), JSON.stringify(deletedInvoices));
    }

    const filtered = invoices.filter((inv) => inv.id !== id);
    localStorage.setItem(getUserKey(INVOICES_KEY), JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }
}

export function loadDeletedInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(getUserKey(DELETED_INVOICES_KEY));
    if (!data) {
      return [];
    }
    return JSON.parse(data) as Invoice[];
  } catch (error) {
    console.error('Error loading deleted invoices:', error);
    return [];
  }
}

export function restoreInvoice(id: string): void {
  try {
    const deletedInvoices = loadDeletedInvoices();
    const invoiceToRestore = deletedInvoices.find((inv) => inv.id === id);
    
    if (invoiceToRestore) {
      // Remove from deleted
      const filtered = deletedInvoices.filter((inv) => inv.id !== id);
      localStorage.setItem(getUserKey(DELETED_INVOICES_KEY), JSON.stringify(filtered));

      // Add back to active invoices
      const invoices = loadInvoices();
      const { deletedAt, ...invoice } = invoiceToRestore as any;
      invoices.push(invoice);
      localStorage.setItem(getUserKey(INVOICES_KEY), JSON.stringify(invoices));
    }
  } catch (error) {
    console.error('Error restoring invoice:', error);
    throw new Error('Failed to restore invoice');
  }
}

export function permanentlyDeleteInvoice(id: string): void {
  try {
    const deletedInvoices = loadDeletedInvoices();
    const filtered = deletedInvoices.filter((inv) => inv.id !== id);
    localStorage.setItem(getUserKey(DELETED_INVOICES_KEY), JSON.stringify(filtered));
  } catch (error) {
    console.error('Error permanently deleting invoice:', error);
    throw new Error('Failed to permanently delete invoice');
  }
}

/**
 * Save company defaults to localStorage
 */
export function saveCompanyDefaults(defaults: CompanyDefaults): void {
  try {
    localStorage.setItem(getUserKey(COMPANY_DEFAULTS_KEY), JSON.stringify(defaults));
  } catch (error) {
    console.error('Error saving company defaults:', error);
    throw new Error('Failed to save company defaults');
  }
}

/**
 * Load company defaults from localStorage
 */
export function loadCompanyDefaults(): CompanyDefaults | null {
  try {
    const data = localStorage.getItem(getUserKey(COMPANY_DEFAULTS_KEY));
    if (!data) {
      return null;
    }
    return JSON.parse(data) as CompanyDefaults;
  } catch (error) {
    console.error('Error loading company defaults:', error);
    return null;
  }
}

