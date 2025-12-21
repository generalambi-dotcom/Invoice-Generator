'use client';

import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import {
  Invoice,
  LineItem,
  Theme,
  Currency,
  CompanyDefaults,
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
import {
  saveInvoice,
  loadInvoices,
  loadInvoice,
  deleteInvoice,
  saveCompanyDefaults,
  loadCompanyDefaults,
} from '@/lib/storage';
import LineItems from './LineItems';
import { format } from 'date-fns';

export default function InvoiceForm() {
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

  const [showShipTo, setShowShipTo] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSaveDefaults, setShowSaveDefaults] = useState(false);

  // Load company defaults on mount
  useEffect(() => {
    const defaults = loadCompanyDefaults();
    if (defaults) {
      setInvoice((prev) => ({
        ...prev,
        company: defaults.company,
        currency: defaults.defaultCurrency,
        theme: defaults.defaultTheme,
        taxRate: defaults.defaultTaxRate,
        notes: defaults.defaultNotes || '',
        bankDetails: defaults.defaultBankDetails || '',
        terms: defaults.defaultTerms || '',
      }));
    }
  }, []);

  // Load invoice history
  useEffect(() => {
    const invoices = loadInvoices();
    setInvoiceHistory(invoices);
  }, []);

  // Load invoice from history page (sessionStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadInvoiceData = sessionStorage.getItem('loadInvoice');
      if (loadInvoiceData) {
        try {
          const invoice = JSON.parse(loadInvoiceData);
          setInvoice(invoice);
          sessionStorage.removeItem('loadInvoice');
        } catch (error) {
          console.error('Error loading invoice from session:', error);
        }
      }
    }
  }, []);

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

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice((prev) => ({
          ...prev,
          company: {
            ...prev.company!,
            logo: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    if (!invoice.invoiceNumber || !invoice.company?.name || !invoice.client?.name) {
      alert('Please fill in required fields: Invoice Number, Company Name, and Client Name');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const completeInvoice: Invoice = {
        id: invoice.id || Date.now().toString(),
        invoiceNumber: invoice.invoiceNumber!,
        invoiceDate: invoice.invoiceDate!,
        dueDate: invoice.dueDate!,
        purchaseOrder: invoice.purchaseOrder,
        company: invoice.company!,
        client: invoice.client!,
        shipTo: invoice.shipTo,
        lineItems: invoice.lineItems || [],
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 0,
        taxAmount: invoice.taxAmount || 0,
        discountRate: invoice.discountRate || 0,
        discountAmount: invoice.discountAmount || 0,
        shipping: invoice.shipping || 0,
        total: invoice.total || 0,
        currency: invoice.currency!,
        theme: invoice.theme!,
        notes: invoice.notes,
        bankDetails: invoice.bankDetails,
        terms: invoice.terms,
        createdAt: invoice.createdAt || new Date().toISOString(),
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

      // Save invoice
      saveInvoice(completeInvoice);
      setInvoiceHistory(loadInvoices());
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Save company defaults
  const handleSaveDefaults = () => {
    if (!invoice.company?.name) {
      alert('Please enter company name first');
      return;
    }

    const defaults: CompanyDefaults = {
      company: invoice.company!,
      defaultCurrency: invoice.currency!,
      defaultTheme: invoice.theme!,
      defaultTaxRate: invoice.taxRate || 0,
      defaultNotes: invoice.notes,
      defaultBankDetails: invoice.bankDetails,
      defaultTerms: invoice.terms,
    };

    saveCompanyDefaults(defaults);
    setShowSaveDefaults(false);
    alert('Company defaults saved!');
  };

  // Load invoice from history
  const loadInvoiceFromHistory = (id: string) => {
    const loaded = loadInvoice(id);
    if (loaded) {
      setInvoice(loaded);
      setShowHistory(false);
    }
  };

  // Delete invoice from history
  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      setInvoiceHistory(loadInvoices());
    }
  };

  // Create new invoice
  const handleNewInvoice = () => {
    if (confirm('Create a new invoice? Current data will be cleared.')) {
      const defaults = loadCompanyDefaults();
      setInvoice({
        invoiceNumber: '',
        invoiceDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        purchaseOrder: '',
        company: defaults?.company || {
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
        taxRate: defaults?.defaultTaxRate || 0,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        shipping: 0,
        total: 0,
        currency: defaults?.defaultCurrency || 'USD',
        theme: defaults?.defaultTheme || 'slate',
        notes: defaults?.defaultNotes || '',
        bankDetails: defaults?.defaultBankDetails || '',
        terms: defaults?.defaultTerms || '',
      });
      setShowShipTo(false);
    }
  };

  // Update theme CSS variables
  useEffect(() => {
    const theme = invoice.theme || 'slate';
    const colors = themeColors[theme];
    document.documentElement.style.setProperty('--theme-primary', colors.primary);
    document.documentElement.style.setProperty('--theme-primary-dark', colors.primaryDark);
    document.documentElement.style.setProperty('--theme-primary-light', colors.primaryLight);
  }, [invoice.theme]);

  const currencySymbol = currencySymbols[invoice.currency || 'USD'];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
            <p className="text-gray-600 mt-1">Create professional invoices in minutes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {showHistory ? 'Hide' : 'Show'} History ({invoiceHistory.length})
            </button>
            <button
              onClick={handleNewInvoice}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              New Invoice
            </button>
          </div>
        </div>

        {/* Invoice History */}
        {showHistory && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
            {invoiceHistory.length === 0 ? (
              <p className="text-gray-500">No invoices yet. Create your first invoice!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Invoice #</th>
                      <th className="text-left p-2">Client</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceHistory.map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{inv.invoiceNumber}</td>
                        <td className="p-2">{inv.client.name}</td>
                        <td className="p-2">{format(new Date(inv.invoiceDate), 'MMM dd, yyyy')}</td>
                        <td className="p-2 text-right">
                          {currencySymbols[inv.currency]} {formatCurrency(inv.total, inv.currency)}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => loadInvoiceFromHistory(inv.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Theme and Currency Selectors */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={invoice.theme}
                    onChange={(e) => updateField('theme', e.target.value as Theme)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="slate">Slate</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="red">Red</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={invoice.currency}
                    onChange={(e) => updateField('currency', e.target.value as Currency)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Company Information</h2>
                <button
                  onClick={() => setShowSaveDefaults(!showSaveDefaults)}
                  className="text-sm text-theme-primary hover:text-theme-primary-dark"
                >
                  {showSaveDefaults ? 'Cancel' : 'Save as Default'}
                </button>
              </div>
              {showSaveDefaults && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800 mb-2">
                    Save your company information to auto-fill future invoices.
                  </p>
                  <button
                    onClick={handleSaveDefaults}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save Defaults
                  </button>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={invoice.company?.name || ''}
                    onChange={(e) => updateField('company.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                  {invoice.company?.logo && (
                    <img
                      src={invoice.company.logo}
                      alt="Company logo"
                      className="mt-2 h-16 object-contain"
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={invoice.company?.address || ''}
                      onChange={(e) => updateField('company.address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={invoice.company?.city || ''}
                      onChange={(e) => updateField('company.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={invoice.company?.state || ''}
                      onChange={(e) => updateField('company.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={invoice.company?.zip || ''}
                      onChange={(e) => updateField('company.zip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={invoice.company?.country || ''}
                      onChange={(e) => updateField('company.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={invoice.company?.phone || ''}
                      onChange={(e) => updateField('company.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={invoice.company?.email || ''}
                      onChange={(e) => updateField('company.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={invoice.company?.website || ''}
                      onChange={(e) => updateField('company.website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Client Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={invoice.client?.name || ''}
                    onChange={(e) => updateField('client.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={invoice.client?.address || ''}
                    onChange={(e) => updateField('client.address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={invoice.client?.city || ''}
                      onChange={(e) => updateField('client.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={invoice.client?.state || ''}
                      onChange={(e) => updateField('client.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={invoice.client?.zip || ''}
                      onChange={(e) => updateField('client.zip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={invoice.client?.country || ''}
                      onChange={(e) => updateField('client.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={invoice.client?.phone || ''}
                      onChange={(e) => updateField('client.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={invoice.client?.email || ''}
                    onChange={(e) => updateField('client.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      value={invoice.invoiceNumber || ''}
                      onChange={(e) => updateField('invoiceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                    <input
                      type="text"
                      value={invoice.purchaseOrder || ''}
                      onChange={(e) => updateField('purchaseOrder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Date *
                    </label>
                    <input
                      type="date"
                      value={invoice.invoiceDate || ''}
                      onChange={(e) => updateField('invoiceDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={invoice.dueDate || ''}
                      onChange={(e) => updateField('dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ship To */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ship To (Optional)</h2>
                <button
                  onClick={() => {
                    setShowShipTo(!showShipTo);
                    if (!showShipTo) {
                      setInvoice((prev) => ({
                        ...prev,
                        shipTo: {
                          name: '',
                          address: '',
                          city: '',
                          state: '',
                          zip: '',
                          country: '',
                        },
                      }));
                    } else {
                      setInvoice((prev) => ({ ...prev, shipTo: undefined }));
                    }
                  }}
                  className="text-sm text-theme-primary hover:text-theme-primary-dark"
                >
                  {showShipTo ? 'Remove' : 'Add'}
                </button>
              </div>
              {showShipTo && invoice.shipTo && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={invoice.shipTo.name || ''}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          shipTo: { ...prev.shipTo!, name: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={invoice.shipTo.address || ''}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          shipTo: { ...prev.shipTo!, address: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={invoice.shipTo.city || ''}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            shipTo: { ...prev.shipTo!, city: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={invoice.shipTo.state || ''}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            shipTo: { ...prev.shipTo!, state: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                      <input
                        type="text"
                        value={invoice.shipTo.zip || ''}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            shipTo: { ...prev.shipTo!, zip: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={invoice.shipTo.country || ''}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            shipTo: { ...prev.shipTo!, country: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Line Items</h2>
              <LineItems
                lineItems={invoice.lineItems || []}
                onUpdate={(items) => updateField('lineItems', items)}
                currency={invoice.currency || 'USD'}
                currencySymbol={currencySymbol}
              />
            </div>

            {/* Additional Charges */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Charges</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={invoice.taxRate || 0}
                      onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      value={invoice.discountRate || 0}
                      onChange={(e) =>
                        updateField('discountRate', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping</label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">{currencySymbol}</span>
                    <input
                      type="number"
                      value={invoice.shipping || 0}
                      onChange={(e) => updateField('shipping', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes, Bank Details, Terms */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={invoice.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    placeholder="Additional notes or comments..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details</label>
                  <textarea
                    value={invoice.bankDetails || ''}
                    onChange={(e) => updateField('bankDetails', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    placeholder="Bank account details for payment..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={invoice.terms || ''}
                    onChange={(e) => updateField('terms', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    placeholder="Payment terms and conditions..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Invoice Preview</h2>
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                {/* Company Header */}
                <div className="mb-6">
                  {invoice.company?.logo && (
                    <img
                      src={invoice.company.logo}
                      alt="Company logo"
                      className="h-12 mb-4 object-contain"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-900">
                    {invoice.company?.name || 'Company Name'}
                  </h3>
                  {invoice.company?.address && (
                    <p className="text-sm text-gray-600 mt-1">
                      {invoice.company.address}
                      {invoice.company.city && `, ${invoice.company.city}`}
                      {invoice.company.state && `, ${invoice.company.state}`}
                      {invoice.company.zip && ` ${invoice.company.zip}`}
                      {invoice.company.country && `, ${invoice.company.country}`}
                    </p>
                  )}
                </div>

                {/* Invoice Title */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">INVOICE</h1>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <div>
                      <p className="text-gray-600">Due Date:</p>
                      <p className="font-semibold">
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                    {invoice.purchaseOrder && (
                      <div>
                        <p className="text-gray-600">PO #:</p>
                        <p className="font-semibold">{invoice.purchaseOrder}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Info */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Bill To:</p>
                  <p className="text-sm text-gray-900">{invoice.client?.name || 'Client Name'}</p>
                  {invoice.client?.address && (
                    <p className="text-sm text-gray-600">
                      {invoice.client.address}
                      {invoice.client.city && `, ${invoice.client.city}`}
                      {invoice.client.state && `, ${invoice.client.state}`}
                      {invoice.client.zip && ` ${invoice.client.zip}`}
                      {invoice.client.country && `, ${invoice.client.country}`}
                    </p>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems && invoice.lineItems.length > 0 ? (
                        invoice.lineItems.map((item, index) => (
                          <tr key={item.id || index} className="border-b border-gray-200">
                            <td className="py-2">{item.description || 'Item description'}</td>
                            <td className="text-right py-2">{item.quantity || 0}</td>
                            <td className="text-right py-2">
                              {currencySymbol} {formatCurrency(item.rate, invoice.currency || 'USD')}
                            </td>
                            <td className="text-right py-2">
                              {currencySymbol} {formatCurrency(item.amount, invoice.currency || 'USD')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-500">
                            No line items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">
                          {currencySymbol}{' '}
                          {formatCurrency(invoice.subtotal || 0, invoice.currency || 'USD')}
                        </span>
                      </div>
                      {invoice.discountAmount && invoice.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Discount ({invoice.discountRate}%):
                          </span>
                          <span className="font-semibold text-red-600">
                            -{currencySymbol}{' '}
                            {formatCurrency(
                              invoice.discountAmount,
                              invoice.currency || 'USD'
                            )}
                          </span>
                        </div>
                      )}
                      {invoice.taxAmount && invoice.taxAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                          <span className="font-semibold">
                            {currencySymbol}{' '}
                            {formatCurrency(invoice.taxAmount, invoice.currency || 'USD')}
                          </span>
                        </div>
                      )}
                      {invoice.shipping && invoice.shipping > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-semibold">
                            {currencySymbol}{' '}
                            {formatCurrency(invoice.shipping, invoice.currency || 'USD')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2 mt-2">
                        <span>Total:</span>
                        <span className="text-theme-primary">
                          {currencySymbol}{' '}
                          {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download PDF Button */}
              <div className="mt-6">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

