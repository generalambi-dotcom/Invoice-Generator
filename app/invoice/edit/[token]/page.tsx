'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import {
  Invoice,
  LineItem,
  Currency,
  CompanyInfo,
  currencySymbols,
} from '@/types/invoice';
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
  formatCurrency,
} from '@/lib/calculations';
import LineItems from '@/components/LineItems';
import { format } from 'date-fns';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invoice, setInvoice] = useState<Partial<Invoice>>({});
  const [owner, setOwner] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [token]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/edit/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load invoice');
      }

      const data = await response.json();
      setInvoice({
        id: data.invoice.id,
        invoiceNumber: data.invoice.invoiceNumber,
        invoiceDate: format(new Date(data.invoice.invoiceDate), 'yyyy-MM-dd'),
        dueDate: format(new Date(data.invoice.dueDate), 'yyyy-MM-dd'),
        purchaseOrder: data.invoice.purchaseOrder || '',
        company: data.invoice.companyInfo as CompanyInfo,
        client: data.invoice.clientInfo as any,
        shipTo: data.invoice.shipToInfo as any,
        lineItems: data.invoice.lineItems as LineItem[],
        subtotal: data.invoice.subtotal,
        taxRate: data.invoice.taxRate || 0,
        taxAmount: data.invoice.taxAmount || 0,
        discountRate: data.invoice.discountRate || 0,
        discountAmount: data.invoice.discountAmount || 0,
        shipping: data.invoice.shipping || 0,
        total: data.invoice.total,
        currency: data.invoice.currency as Currency,
        theme: data.invoice.theme,
        notes: data.invoice.notes || '',
        bankDetails: data.invoice.bankDetails || '',
        terms: data.invoice.terms || '',
      });
      setOwner(data.owner);
    } catch (error: any) {
      setError(error.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate totals when line items or rates change
  useEffect(() => {
    if (!invoice.lineItems) return;
    
    const subtotal = calculateSubtotal(invoice.lineItems);
    const discountAmount = calculateDiscount(subtotal, invoice.discountRate || 0);
    const taxAmount = calculateTax(subtotal - discountAmount, invoice.taxRate || 0);
    const total = calculateTotal(
      subtotal,
      discountAmount,
      taxAmount,
      invoice.shipping || 0
    );

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    }));
  }, [invoice.lineItems, invoice.taxRate, invoice.discountRate, invoice.shipping]);

  const updateField = (field: string, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setInvoice((prev) => ({
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
    setSuccess(false);

    try {
      // Validation
      if (!invoice.client?.name || !invoice.client?.email) {
        throw new Error('Client name and email are required');
      }

      if (!invoice.lineItems || invoice.lineItems.length === 0) {
        throw new Error('At least one line item is required');
      }

      const invoiceData = {
        clientInfo: invoice.client,
        shipToInfo: invoice.shipTo || null,
        lineItems: invoice.lineItems,
        purchaseOrder: invoice.purchaseOrder || null,
        notes: invoice.notes || null,
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 0,
        discountRate: invoice.discountRate || 0,
        shipping: invoice.shipping || 0,
      };

      const response = await fetch(`/api/invoices/edit/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      setError(error.message || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice.invoiceNumber || !invoice.company?.name || !invoice.client?.name) {
      alert('Please fill in all required fields before generating PDF');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const completeInvoice: Invoice = {
        id: invoice.id || '',
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
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading invoice...</div>
      </div>
    );
  }

  if (error && !invoice.invoiceNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            The edit link may be invalid or expired. Please contact {owner?.email || 'the invoice owner'} for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="text-gray-600 mt-1">
            Invoice #{invoice.invoiceNumber} • From {owner?.name || 'Invoice Owner'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Invoice updated successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Client Information */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={invoice.client?.name || ''}
                  onChange={(e) => updateNestedField('client', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={invoice.client?.email || ''}
                  onChange={(e) => updateNestedField('client', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={invoice.client?.address || ''}
                  onChange={(e) => updateNestedField('client', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={invoice.client?.phone || ''}
                  onChange={(e) => updateNestedField('client', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
            <LineItems
              lineItems={invoice.lineItems || []}
              onUpdate={(items) => updateField('lineItems', items)}
              currency={invoice.currency || 'USD'}
              currencySymbol={currencySymbols[invoice.currency || 'USD'] || '$'}
            />
          </div>

          {/* Totals */}
          <div className="border-b pb-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">
                    {currencySymbols[invoice.currency || 'USD']} {formatCurrency(invoice.subtotal || 0, invoice.currency || 'USD')}
                  </span>
                </div>
                {(invoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-medium">
                      -{currencySymbols[invoice.currency || 'USD']} {formatCurrency(invoice.discountAmount || 0, invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                {(invoice.taxAmount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-medium">
                      {currencySymbols[invoice.currency || 'USD']} {formatCurrency(invoice.taxAmount || 0, invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                {(invoice.shipping || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="font-medium">
                      {currencySymbols[invoice.currency || 'USD']} {formatCurrency(invoice.shipping || 0, invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {currencySymbols[invoice.currency || 'USD']} {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={invoice.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="border-t pt-4 flex justify-between gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

