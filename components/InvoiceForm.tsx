'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import {
  Invoice,
  LineItem,
  Theme,
  Currency,
  CompanyDefaults,
  CompanyInfo,
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
  saveInvoiceAPI,
  loadInvoicesAPI,
  loadInvoiceAPI,
  deleteInvoiceAPI,
  generatePaymentLinkAPI,
  sendInvoiceEmailAPI,
  getCompanyDefaultsAPI,
  saveCompanyDefaultsAPI,
  getNextInvoiceNumberAPI,
  getClientsAPI,
  createClientAPI,
  getInvoicePaymentHistoryAPI,
  recordPaymentAPI,
  generateInvoiceEditTokenAPI,
  deletePaymentAPI,
} from '@/lib/api-client';
import LineItems from './LineItems';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/auth';
import { isPremiumUser } from '@/lib/payments';

function InvoiceFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
    currency: 'NGN',
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
  const [companyAddressFormat, setCompanyAddressFormat] = useState<'simple' | 'detailed'>('simple');
  const [clientAddressFormat, setClientAddressFormat] = useState<'simple' | 'detailed'>('simple');
  const [simpleCompanyAddress, setSimpleCompanyAddress] = useState<string>('');
  const [simpleClientAddress, setSimpleClientAddress] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  // Check premium status and load user
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      // Admins automatically have premium access
      const isPremiumUser =
        currentUser.isAdmin === true ||
        (currentUser.subscription?.plan === 'premium' &&
          currentUser.subscription?.status === 'active');
      setIsPremium(isPremiumUser);
    }
  }, []);

  // Sync simple address fields when invoice data changes (e.g., when loading from database)
  useEffect(() => {
    if (companyAddressFormat === 'simple') {
      setSimpleCompanyAddress(getSimpleAddress(invoice.company));
    }
    if (clientAddressFormat === 'simple') {
      setSimpleClientAddress(getSimpleAddress(invoice.client));
    }
  }, [invoice.company, invoice.client, companyAddressFormat, clientAddressFormat]);

  // Load company defaults and generate invoice number on mount
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await getCompanyDefaultsAPI();
        if (defaults) {
          setInvoice((prev) => ({
            ...prev,
            company: defaults.companyInfo as CompanyInfo,
            currency: defaults.defaultCurrency as Currency,
            theme: defaults.defaultTheme as Theme,
            taxRate: defaults.defaultTaxRate || 0,
            notes: defaults.defaultNotes || '',
            bankDetails: defaults.defaultBankDetails || '',
            terms: defaults.defaultTerms || '',
          }));
        }

        // Auto-generate invoice number
        try {
          const numberResult = await getNextInvoiceNumberAPI();
          setInvoice((prev) => ({
            ...prev,
            invoiceNumber: numberResult.invoiceNumber,
          }));
        } catch (error) {
          console.error('Error generating invoice number:', error);
          // Continue without auto-number
        }
      } catch (error) {
        console.error('Error loading company defaults:', error);
        // Continue without defaults
      }
    };
    loadDefaults();
  }, []);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientList = await getClientsAPI();
        setClients(clientList);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };
    if (user) {
      loadClients();
    }
  }, [user]);

  // Load invoice history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const invoices = await loadInvoicesAPI();
        // Convert database format to Invoice format
        const formattedInvoices = invoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          purchaseOrder: inv.purchaseOrder,
          company: inv.companyInfo,
          client: inv.clientInfo,
          shipTo: inv.shipToInfo,
          lineItems: inv.lineItems,
          subtotal: inv.subtotal,
          taxRate: inv.taxRate,
          taxAmount: inv.taxAmount,
          discountRate: inv.discountRate,
          discountAmount: inv.discountAmount,
          shipping: inv.shipping,
          total: inv.total,
          currency: inv.currency,
          theme: inv.theme,
          notes: inv.notes,
          bankDetails: inv.bankDetails,
          terms: inv.terms,
          paymentStatus: inv.paymentStatus,
          paymentLink: inv.paymentLink,
          paymentProvider: inv.paymentProvider,
          paidAmount: inv.paidAmount,
          paymentDate: inv.paymentDate,
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt,
        }));
        setInvoiceHistory(formattedInvoices);
      } catch (error) {
        console.error('Error loading invoices:', error);
        setInvoiceHistory([]);
      }
    };
    loadHistory();
  }, []);

  // Load invoice from URL query parameter (invoiceId) or sessionStorage
  useEffect(() => {
    const loadInvoiceById = async () => {
      // First check URL query parameter
      const invoiceId = searchParams.get('invoiceId');
      if (invoiceId) {
        try {
          const loaded = await loadInvoiceAPI(invoiceId);
          if (loaded) {
            // Convert database format to form format
            setInvoice({
              id: loaded.id,
              invoiceNumber: loaded.invoiceNumber,
              invoiceDate: new Date(loaded.invoiceDate).toISOString().split('T')[0],
              dueDate: new Date(loaded.dueDate).toISOString().split('T')[0],
              purchaseOrder: loaded.purchaseOrder,
              company: loaded.companyInfo,
              client: loaded.clientInfo,
              shipTo: loaded.shipToInfo,
              lineItems: loaded.lineItems,
              subtotal: loaded.subtotal,
              taxRate: loaded.taxRate,
              taxAmount: loaded.taxAmount,
              discountRate: loaded.discountRate,
              discountAmount: loaded.discountAmount,
              shipping: loaded.shipping,
              total: loaded.total,
              currency: loaded.currency,
              theme: loaded.theme,
              notes: loaded.notes,
              bankDetails: loaded.bankDetails,
              terms: loaded.terms,
              paymentStatus: loaded.paymentStatus,
              paymentLink: loaded.paymentLink,
              paymentProvider: loaded.paymentProvider,
              paidAmount: loaded.paidAmount,
              paymentDate: loaded.paymentDate,
              createdAt: loaded.createdAt,
              updatedAt: loaded.updatedAt,
            });

            // Update simple address formats
            if (loaded.companyInfo && typeof loaded.companyInfo === 'object') {
              const company = loaded.companyInfo as any;
              if (company.address) {
                setSimpleCompanyAddress(company.address);
              }
            }
            if (loaded.clientInfo && typeof loaded.clientInfo === 'object') {
              const client = loaded.clientInfo as any;
              if (client.address) {
                setSimpleClientAddress(client.address);
              }
            }

            // Remove invoiceId from URL
            router.replace('/', { scroll: false });
          }
        } catch (error) {
          console.error('Error loading invoice by ID:', error);
        }
        return; // Don't check sessionStorage if invoiceId was in URL
      }

      // Fallback to sessionStorage
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
    };

    loadInvoiceById();
  }, [searchParams, router]);

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

  // Helper function to convert detailed address to simple format
  const getSimpleAddress = (entity: any) => {
    const parts = [
      entity?.address,
      entity?.city,
      entity?.state,
      entity?.zip,
      entity?.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Helper function to parse simple address (basic parsing)
  const parseSimpleAddress = (address: string, type: 'company' | 'client') => {
    // Store the raw input for the textarea
    if (type === 'company') {
      setSimpleCompanyAddress(address);
    } else {
      setSimpleClientAddress(address);
    }

    // Parse and update fields based on comma-separated parts
    const parts = address.split(',').map((p) => p.trim());
    updateField(`${type}.address`, parts[0] || '');
    updateField(`${type}.city`, parts[1] || '');
    updateField(`${type}.state`, parts[2] || '');
    updateField(`${type}.zip`, parts[3] || '');
    updateField(`${type}.country`, parts[4] || '');
  };

  // Save invoice to database (without generating PDF)
  const handleSaveInvoice = async () => {
    // Basic validation
    if (!invoice.invoiceNumber || !invoice.company?.name || !invoice.client?.name) {
      alert('Please fill in required fields: Invoice Number, Company Name, and Client Name');
      return;
    }

    setSavingInvoice(true);
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
        paymentStatus: invoice.paymentStatus || 'pending',
        paymentLink: invoice.paymentLink,
        paymentProvider: invoice.paymentProvider,
        createdAt: invoice.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save invoice to database
      const result = await saveInvoiceAPI(completeInvoice);
      // Update invoice with database ID
      if (result.invoice) {
        setInvoice(prev => ({ ...prev, id: result.invoice.id }));
      }

      // Reload history
      const invoices = await loadInvoicesAPI();
      // Convert database format to Invoice format
      const formattedInvoices = invoices.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        purchaseOrder: inv.purchaseOrder,
        company: inv.companyInfo,
        client: inv.clientInfo,
        shipTo: inv.shipToInfo,
        lineItems: inv.lineItems,
        subtotal: inv.subtotal,
        taxRate: inv.taxRate,
        taxAmount: inv.taxAmount,
        discountRate: inv.discountRate,
        discountAmount: inv.discountAmount,
        shipping: inv.shipping,
        total: inv.total,
        currency: inv.currency,
        theme: inv.theme,
        notes: inv.notes,
        bankDetails: inv.bankDetails,
        terms: inv.terms,
        paymentStatus: inv.paymentStatus,
        paymentLink: inv.paymentLink,
        paymentProvider: inv.paymentProvider,
        paidAmount: inv.paidAmount,
        paymentDate: inv.paymentDate,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      }));
      setInvoiceHistory(formattedInvoices);

      alert('Invoice saved successfully!');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice: ' + (error.message || 'Please try again.'));
    } finally {
      setSavingInvoice(false);
    }
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
        paymentStatus: invoice.paymentStatus || 'pending',
        paymentLink: invoice.paymentLink,
        paymentProvider: invoice.paymentProvider,
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

      // Save invoice to database
      try {
        setSavingInvoice(true);
        const result = await saveInvoiceAPI(completeInvoice);
        // Update invoice with database ID
        if (result.invoice) {
          setInvoice(prev => ({ ...prev, id: result.invoice.id }));
        }
        // Reload history
        const invoices = await loadInvoicesAPI();
        // Convert database format to Invoice format
        const formattedInvoices = invoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          purchaseOrder: inv.purchaseOrder,
          company: inv.companyInfo,
          client: inv.clientInfo,
          shipTo: inv.shipToInfo,
          lineItems: inv.lineItems,
          subtotal: inv.subtotal,
          taxRate: inv.taxRate,
          taxAmount: inv.taxAmount,
          discountRate: inv.discountRate,
          discountAmount: inv.discountAmount,
          shipping: inv.shipping,
          total: inv.total,
          currency: inv.currency,
          theme: inv.theme,
          notes: inv.notes,
          bankDetails: inv.bankDetails,
          terms: inv.terms,
          paymentStatus: inv.paymentStatus,
          paymentLink: inv.paymentLink,
          paymentProvider: inv.paymentProvider,
          paidAmount: inv.paidAmount,
          paymentDate: inv.paymentDate,
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt,
        }));
        setInvoiceHistory(formattedInvoices);
      } catch (error: any) {
        console.error('Error saving invoice:', error);
        alert('Failed to save invoice. Please try again.');
      } finally {
        setSavingInvoice(false);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Duplicate Invoice
  const handleDuplicateInvoice = async (invoiceToDuplicate: Invoice) => {
    if (confirm('Duplicate this invoice? This will create a new invoice with the same details but clear payment history.')) {
      try {
        // Generate new invoice number
        let newInvoiceNumber = '';
        try {
          const numberResult = await getNextInvoiceNumberAPI();
          newInvoiceNumber = numberResult.invoiceNumber;
        } catch (e) {
          console.error('Failed to generate number for duplicate', e);
          newInvoiceNumber = `${invoiceToDuplicate.invoiceNumber}-COPY`;
        }

        setInvoice({
          ...invoiceToDuplicate,
          id: undefined, // Clear ID to treat as new
          invoiceNumber: newInvoiceNumber,
          invoiceDate: format(new Date(), 'yyyy-MM-dd'),
          dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          paymentStatus: 'pending',
          paidAmount: 0,
          paymentDate: undefined,
          paymentLink: undefined, // Clear payment link
          paymentProvider: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        });

        // Close history view and scroll to top
        setShowHistory(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert('Invoice duplicated! Review and save to create the new invoice.');
      } catch (error) {
        console.error('Error duplicating invoice:', error);
        alert('Failed to duplicate invoice');
      }
    }
  };

  // Delete Payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      const result = await deletePaymentAPI(paymentId);

      // Update payment history list
      setPaymentHistory(prev => prev.filter(p => p.id !== paymentId));

      // Update invoice totals if returned
      if (result.invoice && invoice.id === result.invoice.id) {
        setInvoice(prev => ({
          ...prev,
          paidAmount: result.invoice.paidAmount,
          paymentStatus: result.invoice.paymentStatus,
          paymentDate: result.invoice.paymentDate,
        }));
      }

      alert('Payment deleted successfully');
    } catch (error: any) {
      alert('Failed to delete payment: ' + error.message);
    }
  };

  // Save company defaults
  const handleSaveDefaults = async () => {
    if (!invoice.company?.name) {
      alert('Please enter company name first');
      return;
    }

    try {
      const defaults = {
        companyInfo: invoice.company!,
        defaultCurrency: invoice.currency!,
        defaultTheme: invoice.theme!,
        defaultTaxRate: invoice.taxRate || 0,
        defaultNotes: invoice.notes,
        defaultBankDetails: invoice.bankDetails,
        defaultTerms: invoice.terms,
      };

      await saveCompanyDefaultsAPI(defaults);
      setShowSaveDefaults(false);
      alert('Company defaults saved!');
    } catch (error: any) {
      console.error('Error saving company defaults:', error);
      alert('Failed to save company defaults. Please try again.');
    }
  };

  // Load invoice from history
  const loadInvoiceFromHistory = async (id: string) => {
    try {
      const loaded = await loadInvoiceAPI(id);
      if (loaded) {
        // Convert database format to form format
        setInvoice({
          id: loaded.id,
          invoiceNumber: loaded.invoiceNumber,
          invoiceDate: new Date(loaded.invoiceDate).toISOString().split('T')[0],
          dueDate: new Date(loaded.dueDate).toISOString().split('T')[0],
          purchaseOrder: loaded.purchaseOrder,
          company: loaded.companyInfo,
          client: loaded.clientInfo,
          shipTo: loaded.shipToInfo,
          lineItems: loaded.lineItems,
          subtotal: loaded.subtotal,
          taxRate: loaded.taxRate,
          taxAmount: loaded.taxAmount,
          discountRate: loaded.discountRate,
          discountAmount: loaded.discountAmount,
          shipping: loaded.shipping,
          total: loaded.total,
          currency: loaded.currency,
          theme: loaded.theme,
          notes: loaded.notes,
          bankDetails: loaded.bankDetails,
          terms: loaded.terms,
          paymentStatus: loaded.paymentStatus,
          paymentLink: loaded.paymentLink,
          paymentProvider: loaded.paymentProvider,
          paidAmount: loaded.paidAmount,
        });
        setShowHistory(false);

        // Load payment history
        if (loaded.id) {
          try {
            const history = await getInvoicePaymentHistoryAPI(loaded.id);
            setPaymentHistory(history.payments || []);
          } catch (error) {
            console.error('Error loading payment history:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Failed to load invoice. Please try again.');
    }
  };

  // Delete invoice from history
  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoiceAPI(id);
        const invoices = await loadInvoicesAPI();
        setInvoiceHistory(invoices);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  // Create new invoice
  const handleNewInvoice = async () => {
    if (confirm('Create a new invoice? Current data will be cleared.')) {
      let defaults = null;
      try {
        defaults = await getCompanyDefaultsAPI();
      } catch (error) {
        console.error('Error loading company defaults:', error);
      }
      setInvoice({
        invoiceNumber: '',
        invoiceDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        purchaseOrder: '',
        company: (defaults?.companyInfo as CompanyInfo) || {
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
        currency: (defaults?.defaultCurrency as Currency) || 'NGN',
        theme: (defaults?.defaultTheme as Theme) || 'slate',
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

  const currencySymbol = currencySymbols[invoice.currency || 'NGN'];

  return (
    <div className="bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice Generator</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Create professional invoices in minutes</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {showHistory ? 'Hide' : 'Show'} History ({invoiceHistory.length})
            </button>
            <button
              onClick={handleNewInvoice}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              New Invoice
            </button>
          </div>
        </div>

        {/* Invoice History */}
        {showHistory && (
          <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow p-4 sm:p-6">
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
                              title="Load"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDuplicateInvoice(inv)}
                              className="text-green-600 hover:text-green-800"
                              title="Duplicate"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column - Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Theme and Currency Selectors */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="ZAR">ZAR (R)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="GHS">GHS (₵)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="BRL">BRL (R$)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Company Information</h2>
                <div className="flex items-center gap-3">
                  {/* Address Format Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setCompanyAddressFormat('simple');
                        setSimpleCompanyAddress(getSimpleAddress(invoice.company));
                      }}
                      className={`px - 3 py - 1 text - xs sm: text - sm rounded transition - colors ${companyAddressFormat === 'simple'
                        ? 'bg-white text-theme-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        } `}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => {
                        setCompanyAddressFormat('detailed');
                        setSimpleCompanyAddress('');
                      }}
                      className={`px - 3 py - 1 text - xs sm: text - sm rounded transition - colors ${companyAddressFormat === 'detailed'
                        ? 'bg-white text-theme-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        } `}
                    >
                      Detailed
                    </button>
                  </div>
                  <button
                    onClick={() => setShowSaveDefaults(!showSaveDefaults)}
                    className="text-sm text-theme-primary hover:text-theme-primary-dark"
                  >
                    {showSaveDefaults ? 'Cancel' : 'Save as Default'}
                  </button>
                </div>
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

                {/* Address Section - Simple or Detailed */}
                {companyAddressFormat === 'simple' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address
                    </label>
                    <textarea
                      value={simpleCompanyAddress || getSimpleAddress(invoice.company)}
                      onChange={(e) => parseSimpleAddress(e.target.value, 'company')}
                      onBlur={() => {
                        // When user finishes typing, update from parsed values if needed
                        const current = getSimpleAddress(invoice.company);
                        if (current !== simpleCompanyAddress) {
                          setSimpleCompanyAddress(current);
                        }
                      }}
                      placeholder="Enter full address (e.g., 123 Main St, Lagos, Lagos State, 100001, Nigeria)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter address separated by commas: Street, City, State, ZIP, Country
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  </>
                )}
                {/* Phone, Email, Website - Only show in detailed mode */}
                {companyAddressFormat === 'detailed' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Client Information</h2>
                {/* Address Format Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setClientAddressFormat('simple');
                      setSimpleClientAddress(getSimpleAddress(invoice.client));
                    }}
                    className={`px - 3 py - 1 text - xs sm: text - sm rounded transition - colors ${clientAddressFormat === 'simple'
                      ? 'bg-white text-theme-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      } `}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => {
                      setClientAddressFormat('detailed');
                      setSimpleClientAddress('');
                    }}
                    className={`px - 3 py - 1 text - xs sm: text - sm rounded transition - colors ${clientAddressFormat === 'detailed'
                      ? 'bg-white text-theme-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      } `}
                  >
                    Detailed
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value=""
                        onChange={async (e) => {
                          const clientId = e.target.value;
                          if (clientId && clientId !== 'new') {
                            const selectedClient = clients.find(c => c.id === clientId);
                            if (selectedClient) {
                              setInvoice((prev) => ({
                                ...prev,
                                client: {
                                  name: selectedClient.name,
                                  email: selectedClient.email || '',
                                  phone: selectedClient.phone || '',
                                  address: selectedClient.address || '',
                                  city: selectedClient.city || '',
                                  state: selectedClient.state || '',
                                  zip: selectedClient.zip || '',
                                  country: selectedClient.country || '',
                                },
                              }));
                            }
                          } else if (clientId === 'new') {
                            setShowClientModal(true);
                          }
                          e.target.value = '';
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      >
                        <option value="">Select a client or enter manually...</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} {client.email ? `(${client.email})` : ''}
                          </option>
                        ))}
                        <option value="new">+ Add New Client</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={invoice.client?.name || ''}
                      onChange={(e) => updateField('client.name', e.target.value)}
                      placeholder="Client Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      required
                    />
                  </div>
                </div>

                {/* Address Section - Simple or Detailed */}
                {clientAddressFormat === 'simple' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address
                    </label>
                    <textarea
                      value={simpleClientAddress || getSimpleAddress(invoice.client)}
                      onChange={(e) => parseSimpleAddress(e.target.value, 'client')}
                      onBlur={() => {
                        // When user finishes typing, update from parsed values if needed
                        const current = getSimpleAddress(invoice.client);
                        if (current !== simpleClientAddress) {
                          setSimpleClientAddress(current);
                        }
                      }}
                      placeholder="Enter full address (e.g., 123 Main St, Lagos, Lagos State, 100001, Nigeria)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter address separated by commas: Street, City, State, ZIP, Country
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={invoice.client?.address || ''}
                        onChange={(e) => updateField('client.address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  </>
                )}
                {/* Email - Only show in detailed mode */}
                {clientAddressFormat === 'detailed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={invoice.client?.email || ''}
                      onChange={(e) => updateField('client.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number *
                    </label>
                    <div className="flex gap-2 min-w-0">
                      <input
                        type="text"
                        value={invoice.invoiceNumber || ''}
                        onChange={(e) => updateField('invoiceNumber', e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const numberResult = await getNextInvoiceNumberAPI();
                            setInvoice((prev) => ({
                              ...prev,
                              invoiceNumber: numberResult.invoiceNumber,
                            }));
                          } catch (error: any) {
                            alert('Failed to generate invoice number: ' + error.message);
                          }
                        }}
                        className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm whitespace-nowrap"
                        title="Generate next invoice number"
                      >
                        🔄 <span className="hidden xl:inline">Auto</span>
                      </button>
                    </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Line Items</h2>
              <LineItems
                lineItems={invoice.lineItems || []}
                onUpdate={(items) => updateField('lineItems', items)}
                currency={invoice.currency || 'USD'}
                currencySymbol={currencySymbol}
              />
            </div>

            {/* Additional Charges */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Charges</h2>
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
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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
          <div className="lg:sticky lg:top-8 h-fit order-first lg:order-last">
            <div className="bg-gray-100/50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg font-semibold text-gray-700">Preview</h2>
                <div className="text-xs text-gray-500">Auto-updates as you type</div>
              </div>

              {/* Invoice Paper */}
              <div className="bg-white rounded-lg shadow-xl ring-1 ring-black/5 p-8 sm:p-10 min-h-[600px] relative transition-all duration-300">
                {/* Ribbon/Accent Top (Optional - adds nice touch based on theme) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-theme-primary rounded-t-lg opacity-80"></div>

                {/* Header Section - Split Layout */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 mt-2">
                  {/* Left: Company BRAND */}
                  <div className="flex-1">
                    {invoice.company?.logo ? (
                      <img
                        src={invoice.company.logo}
                        alt="Company logo"
                        className="h-16 mb-6 object-contain"
                      />
                    ) : (
                      <div className="h-16 mb-6 flex items-center">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          {invoice.company?.name || 'Your Company'}
                        </h3>
                      </div>
                    )}

                    {/* Company Address */}
                    <div className="text-sm text-gray-500 leading-relaxed">
                      {invoice.company?.name && <p className="font-medium text-gray-900 mb-1">{invoice.company.name}</p>}
                      {invoice.company?.address && <p>{invoice.company.address}</p>}
                      <p>
                        {[
                          invoice.company?.city,
                          invoice.company?.state,
                          invoice.company?.zip,
                          invoice.company?.country
                        ].filter(Boolean).join(', ')}
                      </p>
                      {invoice.company?.phone && <p className="mt-2">{invoice.company.phone}</p>}
                      {invoice.company?.email && <p>{invoice.company.email}</p>}
                      {invoice.company?.website && <p>{invoice.company.website}</p>}
                    </div>
                  </div>

                  {/* Right: Invoice Meta & Title */}
                  <div className="text-right flex-1">
                    <h1 className="text-4xl font-light text-gray-300 tracking-widest uppercase mb-6">Invoice</h1>
                    <div className="space-y-3">
                      <div className="flex justify-between sm:justify-end gap-8 border-b border-gray-100 pb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Number</span>
                        <span className="text-base font-semibold text-gray-900 font-mono">{invoice.invoiceNumber || '#'}</span>
                      </div>
                      <div className="flex justify-between sm:justify-end gap-8 border-b border-gray-100 pb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Date</span>
                        <span className="text-base font-medium text-gray-900">
                          {invoice.invoiceDate
                            ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between sm:justify-end gap-8 border-b border-gray-100 pb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Due</span>
                        <span className="text-base font-medium text-gray-900">
                          {invoice.dueDate
                            ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                            : '—'}
                        </span>
                      </div>
                      {invoice.purchaseOrder && (
                        <div className="flex justify-between sm:justify-end gap-8 border-b border-gray-100 pb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">PO #</span>
                          <span className="text-base font-medium text-gray-900">{invoice.purchaseOrder}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-Header: Bill To & Ship To */}
                <div className="flex flex-col sm:flex-row gap-12 mb-12">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</h4>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      <p className="text-lg font-semibold text-gray-900 mb-1">{invoice.client?.name || 'Client Name'}</p>
                      {invoice.client?.address && <p>{invoice.client.address}</p>}
                      <p>
                        {[
                          invoice.client?.city,
                          invoice.client?.state,
                          invoice.client?.zip,
                          invoice.client?.country
                        ].filter(Boolean).join(', ')}
                      </p>
                      {invoice.client?.email && <p className="mt-2 text-theme-primary">{invoice.client.email}</p>}
                      {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                    </div>
                  </div>

                  {invoice.shipTo && (
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ship To</h4>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-semibold text-gray-900 mb-1">{invoice.shipTo.name || invoice.client?.name}</p>
                        {invoice.shipTo.address && <p>{invoice.shipTo.address}</p>}
                        <p>
                          {[
                            invoice.shipTo.city,
                            invoice.shipTo.state,
                            invoice.shipTo.zip,
                            invoice.shipTo.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="mb-10">
                  <div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Description</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs w-24">Qty</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs w-32">Rate</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider text-xs w-32">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoice.lineItems && invoice.lineItems.length > 0 ? (
                          invoice.lineItems.map((item, index) => (
                            <tr key={item.id || index} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-4 text-gray-900 align-top">
                                <p className="font-medium">{item.description || 'Item description'}</p>
                              </td>
                              <td className="text-right py-4 px-4 text-gray-600 align-top">{item.quantity || 0}</td>
                              <td className="text-right py-4 px-4 text-gray-600 align-top">
                                {currencySymbol} {formatCurrency(item.rate, invoice.currency || 'USD')}
                              </td>
                              <td className="text-right py-4 px-4 font-medium text-gray-900 align-top">
                                {currencySymbol} {formatCurrency(item.amount, invoice.currency || 'USD')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-400 italic">
                              Use the form to add items
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-12">
                  <div className="w-full sm:w-1/2 lg:w-5/12 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">
                        {currencySymbol} {formatCurrency(invoice.subtotal || 0, invoice.currency || 'USD')}
                      </span>
                    </div>

                    {invoice.discountAmount !== undefined && invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount {invoice.discountRate && invoice.discountRate > 0 && `(${invoice.discountRate} %)`}</span>
                        <span>
                          -{currencySymbol} {formatCurrency(invoice.discountAmount || 0, invoice.currency || 'USD')}
                        </span>
                      </div>
                    )}

                    {invoice.taxAmount !== undefined && invoice.taxAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax {invoice.taxRate && invoice.taxRate > 0 && `(${invoice.taxRate} %)`}</span>
                        <span className="font-medium text-gray-900">
                          {currencySymbol} {formatCurrency(invoice.taxAmount || 0, invoice.currency || 'USD')}
                        </span>
                      </div>
                    )}

                    {invoice.shipping !== undefined && invoice.shipping > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium text-gray-900">
                          {currencySymbol} {formatCurrency(invoice.shipping || 0, invoice.currency || 'USD')}
                        </span>
                      </div>
                    )}

                    <div className="border-t-2 border-gray-900 pt-4 mt-4 flex justify-between items-end">
                      <span className="text-base font-bold text-gray-900 uppercase tracking-wider">Total Due</span>
                      <span className="text-2xl font-bold text-theme-primary">
                        {currencySymbol} {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                      </span>
                    </div>

                    {/* Payment Status / Paid Amount */}
                    {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 mt-4 border border-green-100">
                        <div className="flex justify-between text-sm text-green-800 font-medium mb-1">
                          <span>Amount Paid</span>
                          <span>{currencySymbol} {formatCurrency(invoice.paidAmount || 0, invoice.currency || 'USD')}</span>
                        </div>
                        {invoice.total !== undefined && invoice.paidAmount < invoice.total && (
                          <div className="flex justify-between text-sm text-red-600 font-bold border-t border-green-200 pt-1 mt-1">
                            <span>Balance Due</span>
                            <span>{currencySymbol} {formatCurrency(invoice.total - invoice.paidAmount, invoice.currency || 'USD')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Notes */}
                {(invoice.notes || invoice.bankDetails || invoice.terms) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                    {invoice.bankDetails && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{invoice.bankDetails}</p>
                      </div>
                    )}
                    {invoice.notes && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed italic">{invoice.notes}</p>
                      </div>
                    )}
                    {invoice.terms && (
                      <div className="sm:col-span-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                        <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{invoice.terms}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Watermark / Brand */}
                <div className="mt-12 pt-6 border-t border-gray-50 text-center">
                  <p className="text-xs text-gray-300 font-medium">Powered by InvoiceNaija</p>
                </div>

              </div>

              {/* Payment History Section (Outside the paper) */}
              {invoice.id && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-sm font-semibold text-gray-700">Payment History</h3>
                    <button
                      onClick={async () => {
                        if (!invoice.id) return;
                        try {
                          const history = await getInvoicePaymentHistoryAPI(invoice.id);
                          setPaymentHistory(history.payments || []);
                          setShowPaymentHistory(!showPaymentHistory);
                        } catch (error: any) {
                          alert('Failed to load payment history: ' + error.message);
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {showPaymentHistory ? 'Hide' : 'View'}
                    </button>
                  </div>
                  {showPaymentHistory && (
                    <div className="space-y-2">
                      {paymentHistory.length > 0 ? (
                        paymentHistory.map((payment: any) => (
                          <div key={payment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium">
                                  {currencySymbol} {formatCurrency(payment.amount, payment.currency)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {payment.provider === 'manual' ? 'Manual Payment' : payment.provider}
                                  {payment.paidAt && ` • ${format(new Date(payment.paidAt), 'MMM dd, yyyy')}`}
                                </div>
                                {payment.transactionId && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Transaction: {payment.transactionId}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {payment.status}
                                </span>
                                <button
                                  onClick={() => handleDeletePayment(payment.id)}
                                  className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200 border-dashed">
                          No payment history recorded
                        </div>
                      )}

                      {/* Record Payment Button */}
                      {invoice.paymentStatus !== 'paid' && invoice.id && invoice.total && (
                        <button
                          onClick={async () => {
                            const total = invoice.total || 0;
                            const paid = invoice.paidAmount || 0;
                            const outstanding = total - paid;
                            const amount = prompt(
                              `Enter payment amount(Outstanding: ${currencySymbol}${formatCurrency(outstanding, invoice.currency || 'USD')
                              }): `
                            );
                            if (amount && !isNaN(parseFloat(amount)) && invoice.id) {
                              try {
                                await recordPaymentAPI(
                                  invoice.id,
                                  parseFloat(amount),
                                  invoice.currency || 'USD'
                                );
                                // Reload invoice and payment history
                                const loaded = await loadInvoiceAPI(invoice.id);
                                if (loaded) {
                                  setInvoice((prev) => ({
                                    ...prev,
                                    paidAmount: loaded.paidAmount,
                                    paymentStatus: loaded.paymentStatus,
                                  }));
                                }
                                const history = await getInvoicePaymentHistoryAPI(invoice.id);
                                setPaymentHistory(history.payments || []);
                                alert('Payment recorded successfully!');
                              } catch (error: any) {
                                alert('Failed to record payment: ' + error.message);
                              }
                            }
                          }}
                          className="w-full mt-2 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                        >
                          + Record Manual Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Link Section - Premium Only */}
              {isPremium && invoice.total && invoice.total > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">Online Payment Link</h3>
                  </div>

                  {invoice.paymentLink ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={invoice.paymentLink}
                          className="flex-1 px-3 py-2 text-xs border border-blue-200 rounded-lg bg-white font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(invoice.paymentLink || '');
                            alert('Payment link copied to clipboard!');
                          }}
                          className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-500">Provider: <span className="font-medium text-gray-700 capitalize">{invoice.paymentProvider || 'Default'}</span></span>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            if (!user || !invoice.id) return;
                            try {
                              const link = await generatePaymentLinkAPI(invoice.id, 'paypal');
                              setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paypal' }));
                              alert('PayPal payment link updated!');
                            } catch (error: any) { alert(error.message); }
                          }} className="text-xs text-blue-600 hover:underline">Use PayPal</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={async () => {
                            if (!user || !invoice.id) return;
                            try {
                              const link = await generatePaymentLinkAPI(invoice.id, 'paystack');
                              setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paystack' }));
                              alert('Paystack payment link updated!');
                            } catch (error: any) { alert(error.message); }
                          }} className="text-xs text-green-600 hover:underline">Use Paystack</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-600 mb-3">
                        Create a secure payment link for your client to pay online instantly.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!user || !invoice.total || !invoice.id) { alert('Please save the invoice first'); return; }
                            try {
                              const link = await generatePaymentLinkAPI(invoice.id, 'paypal');
                              setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paypal' }));
                            } catch (error: any) { alert(error.message); }
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                        >
                          Create PayPal Link
                        </button>
                        <button
                          onClick={async () => {
                            if (!user || !invoice.total || !invoice.id) { alert('Please save the invoice first'); return; }
                            try {
                              const link = await generatePaymentLinkAPI(invoice.id, 'paystack');
                              setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paystack' }));
                            } catch (error: any) { alert(error.message); }
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors"
                        >
                          Create Paystack Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>   {/* Payment Methods Not Configured Message */}
            {isPremium && invoice.total && invoice.total > 0 && !invoice.paymentLink && (
              <div className="mt-4 sm:mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Connect Payment Methods</h4>
                    <p className="text-xs text-amber-700 mb-2">
                      To automatically generate payment links for your invoices, connect your payment gateway in Settings.
                    </p>
                    <Link
                      href="/settings/payment-methods"
                      className="inline-block text-xs font-medium text-amber-800 hover:text-amber-900 underline"
                    >
                      Go to Payment Methods Settings →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-6 space-y-3">
              {/* Save Invoice Button */}
              <button
                onClick={handleSaveInvoice}
                disabled={savingInvoice || isGeneratingPDF}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingInvoice ? 'Saving...' : '💾 Save Invoice'}
              </button>

              {/* Send Invoice Button - Premium Only */}
              {isPremium && user && invoice.id && invoice.client?.email && (
                <button
                  onClick={async () => {
                    if (!invoice.client?.email || !invoice.id) {
                      alert('Please enter client email address and save the invoice first');
                      return;
                    }

                    setSendingEmail(true);
                    try {
                      await sendInvoiceEmailAPI(
                        invoice.id,
                        invoice.client.email,
                        `Please find your invoice ${invoice.invoiceNumber || 'N/A'} attached.${invoice.paymentLink ? `\n\nPay online: ${invoice.paymentLink}` : ''} `
                      );
                      alert('Invoice sent successfully!');
                    } catch (error: any) {
                      alert('Failed to send invoice: ' + error.message);
                    } finally {
                      setSendingEmail(false);
                    }
                  }}
                  disabled={sendingEmail || !invoice.client?.email || !invoice.id}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Sending...' : '📧 Send Invoice via Email'}
                </button>
              )}

              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || savingInvoice}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Modal */}
      {
        showClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Add New Client</h3>
              </div>
              <div className="overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newClient.city}
                      onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={newClient.state}
                      onChange={(e) => setNewClient({ ...newClient, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={newClient.zip}
                      onChange={(e) => setNewClient({ ...newClient, zip: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <button
                  onClick={async () => {
                    if (!newClient.name) {
                      alert('Client name is required');
                      return;
                    }
                    try {
                      const created = await createClientAPI(newClient);
                      setClients([...clients, created]);
                      setInvoice((prev) => ({
                        ...prev,
                        client: {
                          name: created.name,
                          email: created.email || '',
                          phone: created.phone || '',
                          address: created.address || '',
                          city: created.city || '',
                          state: created.state || '',
                          zip: created.zip || '',
                          country: created.country || '',
                        },
                      }));
                      setNewClient({
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: '',
                      });
                      setShowClientModal(false);
                    } catch (error: any) {
                      alert('Failed to create client: ' + (error.message || 'Unknown error. Please try again.'));
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Save Client
                </button>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setNewClient({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      city: '',
                      state: '',
                      zip: '',
                      country: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default function InvoiceForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <InvoiceFormContent />
    </Suspense>
  );
}
