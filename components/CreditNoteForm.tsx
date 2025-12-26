'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
  createCreditNoteAPI,
  getCreditNoteAPI,
  updateCreditNoteAPI,
  getCompanyDefaultsAPI,
  getClientsAPI,
  loadInvoicesAPI,
} from '@/lib/api-client';
import {
  LineItem,
  Currency,
  CompanyInfo,
  currencySymbols,
} from '@/types/invoice';
import {
  calculateSubtotal,
  calculateTax,
  formatCurrency,
} from '@/lib/calculations';
import LineItems from './LineItems';
import { format } from 'date-fns';

interface CreditNoteFormProps {
  id?: string;
  editMode?: boolean;
  onSuccess?: () => void;
}

export default function CreditNoteForm({ id, editMode = false, onSuccess }: CreditNoteFormProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [creditNote, setCreditNote] = useState({
    creditNoteNumber: '',
    creditNoteDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    invoiceId: null as string | null,
    company: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
      email: '',
      website: '',
    } as CompanyInfo,
    client: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
      email: '',
    },
    lineItems: [
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ] as LineItem[],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    currency: 'USD' as Currency,
    notes: '',
  });

  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    setUser(currentUser);
    
    loadData();
    
    if (id) {
      loadCreditNote();
    }
  }, [id]);

  const loadData = async () => {
    try {
      // Load company defaults
      const defaults = await getCompanyDefaultsAPI();
      if (defaults) {
        setCreditNote((prev) => ({
          ...prev,
          company: defaults.companyInfo as CompanyInfo,
          currency: (defaults.defaultCurrency || 'USD') as Currency,
          taxRate: defaults.defaultTaxRate || 0,
        }));
      }
      
      // Load clients
      const clientList = await getClientsAPI();
      setClients(clientList);
      
      // Load invoices for selection
      const invoiceList = await loadInvoicesAPI();
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadCreditNote = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const result = await getCreditNoteAPI(id);
      const note = result.creditNote;
      
      setCreditNote({
        creditNoteNumber: note.creditNoteNumber,
        creditNoteDate: format(new Date(note.creditNoteDate), 'yyyy-MM-dd'),
        reason: note.reason || '',
        invoiceId: note.invoiceId,
        company: note.companyInfo as CompanyInfo,
        client: note.clientInfo as any,
        lineItems: note.lineItems as LineItem[],
        subtotal: note.subtotal,
        taxRate: note.taxRate || 0,
        taxAmount: note.taxAmount || 0,
        total: note.total,
        currency: note.currency as Currency,
        notes: note.notes || '',
      });
    } catch (error: any) {
      setError(error.message || 'Failed to load credit note');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate totals when line items or tax change
  useEffect(() => {
    const subtotal = calculateSubtotal(creditNote.lineItems);
    const taxAmount = calculateTax(subtotal, creditNote.taxRate);
    const total = subtotal + taxAmount;
    
    setCreditNote((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      total,
    }));
  }, [creditNote.lineItems, creditNote.taxRate]);

  const updateField = (field: string, value: any) => {
    setCreditNote((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setCreditNote((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      // Validation
      if (!creditNote.creditNoteNumber) {
        throw new Error('Credit note number is required');
      }

      if (!creditNote.company.name || !creditNote.client.name) {
        throw new Error('Company and client information are required');
      }

      if (!creditNote.lineItems || creditNote.lineItems.length === 0) {
        throw new Error('At least one line item is required');
      }

      const creditNoteData = {
        creditNoteNumber: creditNote.creditNoteNumber,
        creditNoteDate: creditNote.creditNoteDate,
        reason: creditNote.reason || null,
        invoiceId: creditNote.invoiceId || null,
        companyInfo: creditNote.company,
        clientInfo: creditNote.client,
        lineItems: creditNote.lineItems,
        subtotal: creditNote.subtotal,
        taxAmount: creditNote.taxAmount,
        total: creditNote.total,
        currency: creditNote.currency,
        notes: creditNote.notes || null,
      };

      if (id && editMode) {
        await updateCreditNoteAPI(id, creditNoteData);
      } else {
        await createCreditNoteAPI(creditNoteData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/credit-notes');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save credit note');
    } finally {
      setSaving(false);
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setCreditNote((prev) => ({
        ...prev,
        invoiceId: invoiceId,
        client: invoice.clientInfo as any,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/credit-notes"
            className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back to Credit Notes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {id && editMode ? 'Edit Credit Note' : id ? 'View Credit Note' : 'Create Credit Note'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Credit Note Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Note Number *
              </label>
              <input
                type="text"
                value={creditNote.creditNoteNumber}
                onChange={(e) => updateField('creditNoteNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!!id && !editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={creditNote.creditNoteDate}
                onChange={(e) => updateField('creditNoteDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!!id && !editMode}
              />
            </div>
          </div>

          {/* Link to Invoice (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Invoice (Optional)
            </label>
            <select
              value={creditNote.invoiceId || ''}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!!id && !editMode}
            >
              <option value="">Select an invoice...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {(inv.clientInfo as any)?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={creditNote.reason}
              onChange={(e) => updateField('reason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              disabled={!!id && !editMode}
              placeholder="Reason for credit note (e.g., Return, Discount, Correction)"
            />
          </div>

          {/* Company Information */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={creditNote.company.name}
                  onChange={(e) => updateNestedField('company', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!id && !editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={creditNote.company.email}
                  onChange={(e) => updateNestedField('company', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!id && !editMode}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={creditNote.company.address}
                  onChange={(e) => updateNestedField('company', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!id && !editMode}
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={creditNote.client.name}
                  onChange={(e) => updateNestedField('client', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!id && !editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={creditNote.client.email}
                  onChange={(e) => updateNestedField('client', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!id && !editMode}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={creditNote.client.address}
                  onChange={(e) => updateNestedField('client', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!id && !editMode}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
            <LineItems
              lineItems={creditNote.lineItems}
              onUpdate={(items) => updateField('lineItems', items)}
              currency={creditNote.currency}
              currencySymbol={currencySymbols[creditNote.currency] || '$'}
            />
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">
                    {currencySymbols[creditNote.currency]} {formatCurrency(creditNote.subtotal, creditNote.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax ({creditNote.taxRate}%):</span>
                  <span className="font-medium">
                    {currencySymbols[creditNote.currency]} {formatCurrency(creditNote.taxAmount, creditNote.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {currencySymbols[creditNote.currency]} {formatCurrency(creditNote.total, creditNote.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={creditNote.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              disabled={!!id && !editMode}
            />
          </div>

          {/* Actions */}
          {(!id || editMode) && (
            <div className="border-t pt-4 flex justify-end gap-3">
              <Link
                href="/credit-notes"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : id && editMode ? 'Update Credit Note' : 'Create Credit Note'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

