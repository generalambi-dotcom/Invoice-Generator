'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import {
  Invoice,
  LineItem,
  Theme,
  Currency,
  CompanyInfo,
  ClientInfo,
  currencySymbols,
  themeColors,
} from '@/types/invoice';
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
  formatCurrency,
} from '@/lib/calculations';
import LineItems from './LineItems';
import { format } from 'date-fns';

interface PublicInvoiceFormProps {
  slug: string;
}

export default function PublicInvoiceForm({ slug }: PublicInvoiceFormProps) {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Form state
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    purchaseOrder: '',
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
      logo: undefined,
    },
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
    shipTo: undefined,
    lineItems: [
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    shipping: 0,
    total: 0,
    currency: 'USD',
    theme: 'slate',
    notes: '',
    bankDetails: '',
    terms: '',
  });

  // Load company info on mount
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const response = await fetch(`/api/public/invoice/${slug}`);
        if (!response.ok) {
          throw new Error('Invoice link not found');
        }
        const data = await response.json();
        setCompanyInfo(data);
        
        // Pre-fill company info
        if (data.companyInfo) {
          setInvoice((prev) => ({
            ...prev,
            company: data.companyInfo as CompanyInfo,
            currency: (data.defaultCurrency || 'USD') as Currency,
            theme: (data.defaultTheme || 'slate') as Theme,
            taxRate: data.defaultTaxRate || 0,
          }));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice information');
      } finally {
        setLoading(false);
      }
    };
    loadCompanyInfo();
  }, [slug]);

  // Recalculate totals when line items, tax, discount, or shipping change
  useEffect(() => {
    const subtotal = calculateSubtotal(invoice.lineItems || []);
    const taxAmount = calculateTax(subtotal, invoice.taxRate || 0);
    const discountAmount = calculateDiscount(subtotal, invoice.discountRate || 0);
    const total = calculateTotal(subtotal, taxAmount, discountAmount, invoice.shipping || 0);

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      discountAmount,
      total,
    }));
  }, [invoice.lineItems, invoice.taxRate, invoice.discountRate, invoice.shipping]);

  // Update invoice field
  const updateField = (field: string, value: any) => {
    setInvoice((prev) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const [parent, child] = keys;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        };
      }
    });
  };

  // Save invoice
  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      // Validation
      if (!invoice.client?.name || !invoice.client?.email) {
        throw new Error('Please fill in your name and email');
      }

      if (!invoice.lineItems || invoice.lineItems.length === 0) {
        throw new Error('Please add at least one line item');
      }

      if (!invoice.invoiceNumber) {
        // Generate a simple invoice number if not provided
        setInvoice((prev) => ({
          ...prev,
          invoiceNumber: `INV-${Date.now()}`,
        }));
      }

      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: invoice.invoiceDate || format(new Date(), 'yyyy-MM-dd'),
        dueDate: invoice.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        purchaseOrder: invoice.purchaseOrder || null,
        companyInfo: invoice.company,
        clientInfo: invoice.client,
        shipToInfo: invoice.shipTo || null,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 0,
        taxAmount: invoice.taxAmount || 0,
        discountRate: invoice.discountRate || 0,
        discountAmount: invoice.discountAmount || 0,
        shipping: invoice.shipping || 0,
        total: invoice.total || 0,
        currency: invoice.currency || 'USD',
        theme: invoice.theme || 'slate',
        notes: invoice.notes || null,
        bankDetails: invoice.bankDetails || null,
        terms: invoice.terms || null,
        customerEmail: invoice.client?.email,
      };

      // If invoiceId exists, update existing invoice; otherwise create new one
      const method = invoiceId ? 'PATCH' : 'POST';
      const requestData = invoiceId 
        ? { invoiceId, ...invoiceData }
        : invoiceData;

      const response = await fetch(`/api/public/invoice/${slug}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save invoice');
      }

      const result = await response.json();
      
      // Set invoiceId if it's a new invoice, or keep existing one if updating
      if (!invoiceId && result.invoice?.id) {
        setInvoiceId(result.invoice.id);
      }
      
      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    try {
      if (!invoice.invoiceNumber || !invoice.company?.name || !invoice.client?.name) {
        alert('Please fill in all required fields before generating PDF');
        return;
      }

      const completeInvoice: Invoice = {
        id: invoiceId || '',
        invoiceNumber: invoice.invoiceNumber!,
        invoiceDate: invoice.invoiceDate!,
        dueDate: invoice.dueDate!,
        purchaseOrder: invoice.purchaseOrder,
        company: invoice.company!,
        client: invoice.client!,
        shipTo: invoice.shipTo,
        lineItems: invoice.lineItems!,
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 0,
        taxAmount: invoice.taxAmount || 0,
        discountRate: invoice.discountRate || 0,
        discountAmount: invoice.discountAmount || 0,
        shipping: invoice.shipping || 0,
        total: invoice.total || 0,
        currency: invoice.currency || 'USD',
        theme: invoice.theme || 'slate',
        notes: invoice.notes,
        bankDetails: invoice.bankDetails,
        terms: invoice.terms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const blob = await pdf(<InvoicePDF invoice={completeInvoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${completeInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const currencySymbol = currencySymbols[invoice.currency || 'USD'] || '$';
  const themeColor = themeColors[invoice.theme || 'slate'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !companyInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Link Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Invoice</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your invoice for {companyInfo?.companyName || 'this company'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Invoice Created Successfully!</h3>
                <p className="text-green-700 mt-1">
                  Your invoice has been saved. You can now download the PDF or pay directly.
                </p>
                {invoice.paymentLink && (
                  <a
                    href={invoice.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Pay Invoice
                  </a>
                )}
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={invoice.client?.name || ''}
                      onChange={(e) => updateField('client.name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={invoice.client?.email || ''}
                      onChange={(e) => updateField('client.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Address
                  </label>
                  <textarea
                    value={invoice.client?.address || ''}
                    onChange={(e) => updateField('client.address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={invoice.client?.phone || ''}
                      onChange={(e) => updateField('client.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoice.invoiceNumber || ''}
                      onChange={(e) => updateField('invoiceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={invoice.invoiceDate || ''}
                      onChange={(e) => updateField('invoiceDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={invoice.dueDate || ''}
                      onChange={(e) => updateField('dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Line Items</h2>
              <LineItems
                lineItems={invoice.lineItems || []}
                currency={invoice.currency || 'USD'}
                currencySymbol={currencySymbol}
                onUpdate={(items) => updateField('lineItems', items)}
              />
            </div>

            {/* Additional Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Options</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={invoice.taxRate || 0}
                      onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={invoice.discountRate || 0}
                      onChange={(e) => updateField('discountRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping</label>
                  <input
                    type="number"
                    value={invoice.shipping || 0}
                    onChange={(e) => updateField('shipping', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={invoice.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes or comments..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Invoice'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!invoice.invoiceNumber || !invoice.company?.name || !invoice.client?.name}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                {/* Company Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {invoice.company?.name || 'Company Name'}
                  </h3>
                  {invoice.company?.address && (
                    <p className="text-sm text-gray-600 mt-1">{invoice.company.address}</p>
                  )}
                </div>

                {/* Invoice Title */}
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-gray-900 mb-3">INVOICE</h1>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Invoice #:</p>
                      <p className="font-semibold">{invoice.invoiceNumber || 'INV-001'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date:</p>
                      <p className="font-semibold">
                        {invoice.invoiceDate
                          ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Bill To:</p>
                  <p className="text-sm text-gray-900">{invoice.client?.name || 'Your Name'}</p>
                  {invoice.client?.address && (
                    <p className="text-sm text-gray-600">{invoice.client.address}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">
                        {currencySymbol} {formatCurrency(invoice.subtotal || 0, invoice.currency || 'USD')}
                      </span>
                    </div>
                    {invoice.taxAmount && invoice.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                        <span className="font-semibold">
                          {currencySymbol} {formatCurrency(invoice.taxAmount, invoice.currency || 'USD')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2 mt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        {currencySymbol} {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

