'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import InvoicePaper from './InvoicePaper';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import { SendEmailModal } from './SendEmailModal';
import { Mail } from 'lucide-react';
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
  getTemplatesAPI,
  saveAsTemplateAPI,
  loadTemplateAPI,
  deleteTemplateAPI,
} from '@/lib/api-client';
import LineItems from './LineItems';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/auth';
import { isPremiumUser } from '@/lib/payments';
import ImageUpload from '@/components/ImageUpload';

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSaveDefaults, setShowSaveDefaults] = useState(false);
  const [companyAddressFormat, setCompanyAddressFormat] = useState<'simple' | 'detailed'>('simple');
  const [clientAddressFormat, setClientAddressFormat] = useState<'simple' | 'detailed'>('simple');
  const [simpleCompanyAddress, setSimpleCompanyAddress] = useState<string>('');
  const [simpleClientAddress, setSimpleClientAddress] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'viewed' | 'updated'>('viewed');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [emailActivity, setEmailActivity] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);
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

  // Guest post-download flow state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showGuestPostDownloadModal, setShowGuestPostDownloadModal] = useState(false);
  const [guestEmailStep, setGuestEmailStep] = useState<1 | 2>(1);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailLoading, setGuestEmailLoading] = useState(false);
  const [addressModes, setAddressModes] = useState<{
    company: 'simple' | 'detailed';
    client: 'simple' | 'detailed';
    shipTo: 'simple' | 'detailed';
  }>({
    company: 'simple',
    client: 'simple',
    shipTo: 'simple'
  });

  // AI Generation State
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);



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

  const loadCompanyDefaults = async () => {
    if (!user) return; // Changed currentUser to user
    try {
      const defaults = await getCompanyDefaultsAPI();
      if (defaults) {
        setInvoice((prev) => ({
          ...prev,
          company: {
            ...prev.company!, // Ensure company object exists
            name: defaults.name || prev.company?.name || '',
            address: defaults.address || prev.company?.address || '',
            city: defaults.city || prev.company?.city || '',
            state: defaults.state || prev.company?.state || '',
            zip: defaults.zip || prev.company?.zip || '',
            country: defaults.country || prev.company?.country || '',
            phone: defaults.phone || prev.company?.phone || '',
            email: defaults.email || prev.company?.email || '',
            website: defaults.website || prev.company?.website || '',
            logo: defaults.logo || prev.company?.logo,
          },
          terms: defaults.defaultTerms || prev.terms,
          notes: defaults.defaultNotes || prev.notes,
          bankDetails: defaults.defaultBankDetails || prev.bankDetails,
        }));
      }
    } catch (error) {
      console.error('Failed to load company defaults:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadCompanyDefaults();
    }
  }, [user]);

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
      const convertFrom = searchParams.get('convertFrom');
      const targetId = invoiceId || convertFrom;

      if (targetId) {
        try {
          const loaded = await loadInvoiceAPI(targetId);
          if (loaded) {
            let newInvoiceNumber = loaded.invoiceNumber;
            if (convertFrom) {
              try {
                const numberResult = await getNextInvoiceNumberAPI();
                newInvoiceNumber = numberResult.invoiceNumber;
              } catch (e) {
                newInvoiceNumber = `${loaded.invoiceNumber}-INV`;
              }
            }

            // Convert database format to form format
            setInvoice({
              id: convertFrom ? undefined : loaded.id,
              type: convertFrom ? 'invoice' : loaded.type,
              invoiceNumber: newInvoiceNumber,
              invoiceDate: convertFrom ? new Date().toISOString().split('T')[0] : new Date(loaded.invoiceDate).toISOString().split('T')[0],
              dueDate: convertFrom ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(loaded.dueDate).toISOString().split('T')[0],
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
              paymentStatus: convertFrom ? 'pending' : loaded.paymentStatus,
              paymentLink: convertFrom ? undefined : loaded.paymentLink,
              paymentProvider: convertFrom ? undefined : loaded.paymentProvider,
              paidAmount: convertFrom ? 0 : loaded.paidAmount,
              paymentDate: convertFrom ? undefined : loaded.paymentDate,
              createdAt: convertFrom ? undefined : loaded.createdAt,
              updatedAt: convertFrom ? undefined : loaded.updatedAt,
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

            // Capture email activity for timeline
            if (loaded._emailLogs && !convertFrom) {
              setEmailActivity(loaded._emailLogs);
            }

            if (convertFrom) {
              toast.success('Converted Document into a new Invoice. Review and save below.');
            }

            // Remove invoiceId/convertFrom from URL but stay on the same page
            const currentPath = window.location.pathname;
            router.replace(currentPath, { scroll: false });
          }
        } catch (error) {
          console.error('Error loading invoice by ID:', error);
        }
        return; // Don't check sessionStorage if invoiceId or convertFrom was in URL
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

  // AI Auto-trigger from URL Prompt
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt && typeof urlPrompt === 'string') {
      setShowAIPrompt(true);
      setAiPrompt(urlPrompt);

      // Clean up the URL parameter immediately to prevent re-triggering
      const currentPath = window.location.pathname;
      router.replace(currentPath, { scroll: false });

      // Trigger generation immediately with the URL string
      handleAIGenerate(urlPrompt);
    }
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
    // Dynamic validation
    const missingFields: string[] = [];
    if (!invoice.invoiceNumber) missingFields.push('Invoice Number');
    if (!invoice.company?.name) missingFields.push('Company Name');
    if (!invoice.client?.name) missingFields.push('Client Name');

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
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
      const payload = { ...completeInvoice };
      if (!invoice.id) {
        delete (payload as any).id;
      }
      const result = await saveInvoiceAPI(payload);
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

      toast.success('Invoice saved successfully!');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      if (error.message === 'FREE_PLAN_LIMIT_REACHED') {
        setShowLimitModal(true);
      } else {
        toast.error('Failed to save invoice: ' + (error.message || 'Please try again.'));
      }
    } finally {
      setSavingInvoice(false);
    }
  };

  // Generate Invoice via AI
  const handleAIGenerate = async (overridePrompt?: string | React.MouseEvent) => {
    // If called from a UI event, overridePrompt will be an event object. We only want a string.
    const promptToUse = typeof overridePrompt === 'string' ? overridePrompt : aiPrompt;
    if (!promptToUse.trim()) return;

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate invoice data.');
      }

      // Merge the generated data into the current invoice state
      setInvoice((prev) => {
        let newDueDate = prev.dueDate;

        // Calculate new due date if offset is provided
        if (data.dueDateOffsetDays !== undefined) {
          const d = new Date();
          d.setDate(d.getDate() + data.dueDateOffsetDays);
          newDueDate = format(d, 'yyyy-MM-dd');
        }

        return {
          ...prev,
          client: {
            ...prev.client!,
            name: data.clientName || prev.client?.name || '',
            email: data.clientEmail || prev.client?.email || '',
            address: data.clientAddress || prev.client?.address || '',
          },
          lineItems: data.lineItems && data.lineItems.length > 0
            ? data.lineItems.map((item: any, i: number) => ({
              id: Date.now().toString() + i,
              description: item.description || '',
              quantity: item.quantity || 1,
              rate: item.rate || 0,
              amount: (item.quantity || 1) * (item.rate || 0),
            }))
            : prev.lineItems,
          notes: data.notes || prev.notes || '',
          dueDate: newDueDate,
        };
      });

      toast.success('Invoice drafted successfully with AI!');
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (error: any) {
      console.error('AI error:', error);
      toast.error(error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    // Auto-generate invoice number if missing on download
    let currentInvoiceNumber = invoice.invoiceNumber;
    if (!currentInvoiceNumber) {
      currentInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      setInvoice((prev) => ({ ...prev, invoiceNumber: currentInvoiceNumber }));
    }

    // Dynamic validation for company and client
    const missingFields: string[] = [];
    if (!invoice.company?.name) missingFields.push('Company Name');
    if (!invoice.client?.name) missingFields.push('Client Name');

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const completeInvoice: Invoice = {
        id: invoice.id || Date.now().toString(),
        invoiceNumber: currentInvoiceNumber!,
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

      toast.success('Invoice downloaded successfully!');
      if (!user) {
        // Track guest invoice download in Google Analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'generate_invoice', {
            event_category: 'engagement',
            event_label: 'guest_invoice_download',
          });
        }
        
        setShowGuestPostDownloadModal(true);
        setGuestEmailStep(1);
      }

      // Skip saving for guests to prevent "Failed to save" error
      if (user) {
        try {
          setSavingInvoice(true);
          const payload = { ...completeInvoice };
          if (!invoice.id) {
            delete (payload as any).id;
          }
          const result = await saveInvoiceAPI(payload);
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
          if (error.message === 'FREE_PLAN_LIMIT_REACHED') {
            setShowLimitModal(true);
          } else {
            toast.error('Failed to save invoice. Please try again.');
          }
        } finally {
          setSavingInvoice(false);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = async () => {
    const companyName = invoice.company?.name || 'us';

    // For guest users, share invoice details as text (no save needed)
    if (!user) {
      const currSymbol = currencySymbols[invoice.currency || 'NGN'];
      const totalFormatted = `${currSymbol}${formatCurrency(invoice.total || 0, invoice.currency || 'NGN')}`;
      const text = `Invoice ${invoice.invoiceNumber || 'N/A'} from ${companyName}\nTotal: ${totalFormatted}\nDate: ${invoice.invoiceDate || 'N/A'}\nDue: ${invoice.dueDate || 'N/A'}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      return;
    }

    // If invoice isn't saved yet, save it first
    let currentInvoiceId = invoice.id;
    if (!currentInvoiceId) {
      toast.loading('Saving invoice to generate shareable link...', { id: 'saving-share' });
      try {
        const completeInvoice: Invoice = {
          id: Date.now().toString(),
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
          currency: invoice.currency || 'USD',
          theme: invoice.theme || 'slate',
          paymentStatus: 'pending',
          createdAt: invoice.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const payload = { ...completeInvoice };
        delete (payload as any).id;
        const result = await saveInvoiceAPI(payload);
        if (result.invoice) {
          currentInvoiceId = result.invoice.id;
          setInvoice(prev => ({ ...prev, id: result.invoice.id }));
        }
        toast.dismiss('saving-share');
      } catch (error: any) {
        toast.dismiss('saving-share');
        if (error.message === 'FREE_PLAN_LIMIT_REACHED') {
          setShowLimitModal(true);
        } else {
          toast.error('Failed to save invoice for sharing.');
        }
        return;
      }
    }

    if (!currentInvoiceId) return;

    const url = `${window.location.origin}/invoice/${currentInvoiceId}`;
    const text = `Here is your invoice ${invoice.invoiceNumber} from ${companyName}: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
        toast.success('Invoice duplicated! Review and save to create the new invoice.');
      } catch (error) {
        console.error('Error duplicating invoice:', error);
        toast.error('Failed to duplicate invoice');
      }
    }
  };

  // Save as Template
  const handleSaveAsTemplate = async () => {
    const name = prompt('Template name:');
    if (!name) return;

    setSavingTemplate(true);
    try {
      await saveAsTemplateAPI({
        name,
        companyInfo: invoice.company,
        clientInfo: invoice.client,
        lineItems: invoice.lineItems,
        currency: invoice.currency,
        theme: invoice.theme,
        notes: invoice.notes,
        bankDetails: invoice.bankDetails,
        terms: invoice.terms,
        taxRate: invoice.taxRate,
        discountRate: invoice.discountRate,
      });
      toast.success('Template saved successfully!');
      // Refresh templates list
      try {
        const tpls = await getTemplatesAPI();
        setTemplates(tpls);
      } catch (e) { }
    } catch (error: any) {
      toast.error('Failed to save template: ' + error.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  // Load from Template
  const handleLoadTemplate = async (templateId: string) => {
    try {
      const template = await loadTemplateAPI(templateId);
      if (!template) return;

      // Generate new invoice number
      let newNumber = '';
      try {
        const result = await getNextInvoiceNumberAPI();
        newNumber = result.invoiceNumber;
      } catch (e) {
        newNumber = '';
      }

      setInvoice(prev => ({
        ...prev,
        id: undefined,
        invoiceNumber: newNumber,
        invoiceDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        company: template.companyInfo || prev.company,
        client: template.clientInfo || prev.client,
        lineItems: template.lineItems || prev.lineItems,
        currency: template.currency || prev.currency,
        theme: template.theme || prev.theme,
        notes: template.notes || prev.notes,
        bankDetails: template.bankDetails || prev.bankDetails,
        terms: template.terms || prev.terms,
        taxRate: template.taxRate || prev.taxRate,
        discountRate: template.discountRate || prev.discountRate,
        paymentStatus: 'pending',
        paidAmount: 0,
        paymentDate: undefined,
        paymentLink: undefined,
        paymentProvider: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      }));

      setShowTemplateDropdown(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(`Template "${template.name}" loaded! Adjust details and save.`);
    } catch (error: any) {
      toast.error('Failed to load template: ' + error.message);
    }
  };

  // Load templates list
  const loadTemplates = async () => {
    try {
      const tpls = await getTemplatesAPI();
      setTemplates(tpls);
    } catch (e) {
      // Silent fail - templates are optional
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

      toast.success('Payment deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete payment: ' + error.message);
    }
  };

  // Save company defaults
  const handleSaveDefaults = async () => {
    if (!invoice.company?.name) {
      toast.error('Please enter company name first');
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
      toast.success('Company defaults saved!');
    } catch (error: any) {
      console.error('Error saving company defaults:', error);
      toast.error('Failed to save company defaults. Please try again.');
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
      toast.error('Failed to load invoice. Please try again.');
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
        toast.error('Failed to delete invoice. Please try again.');
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
    <>
      <div className="bg-white py-4 sm:py-8">
        <div className="max-w-[100rem] mx-auto px-0 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                {invoice.type === 'estimate' ? 'Estimate Generator' : invoice.type === 'credit_note' ? 'Credit Note Generator' : 'Invoice Generator'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Create professional documents in minutes</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setShowAIPrompt(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="text-lg leading-none">✨</span>
                Create with AI
              </button>
              <div className="hidden xl:flex text-right flex-col items-end border-l border-gray-200 pl-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Draft</span>
                <span className="text-xs text-gray-300">Edited just now</span>
              </div>
            </div>
          </div>

          {/* AI Prompt Modal */}
          {showAIPrompt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 transition-all" style={{ margin: 0 }}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-indigo-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">✨</span> Draft with AI
                  </h3>
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white p-1"
                    disabled={isGeneratingAI}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Describe the invoice you want to create:
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'I need to bill Acme Corp $1500 for the April Marketing Campaign. Also add a $200 setup fee. Make it due in 15 days.'"
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner resize-none mb-4"
                    disabled={isGeneratingAI}
                    autoFocus
                  />
                  <div className="flex items-start gap-3 bg-blue-50/50 text-blue-800 text-xs p-4 rounded-xl">
                    <span className="text-blue-500 mt-0.5">ℹ️</span>
                    <p className="leading-relaxed">
                      The AI will read your prompt and automatically fill out the Client details, Line Items, Rates, and Due Date. You can review and edit everything before saving.
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={isGeneratingAI}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAIGenerate}
                    disabled={!aiPrompt.trim() || isGeneratingAI}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating Draft...
                      </>
                    ) : (
                      <>
                        <span className="text-lg leading-none">✨</span>
                        Generate Draft
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice History */}
          {showHistory && (
            <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Invoice History</h2>
                {selectedInvoices.size > 0 && (
                  <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                    {selectedInvoices.size} selected
                  </span>
                )}
              </div>
              {invoiceHistory.length === 0 ? (
                <p className="text-gray-500">No invoices yet. Create your first invoice!</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 w-8">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={selectedInvoices.size === invoiceHistory.length && invoiceHistory.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices(new Set(invoiceHistory.map(inv => inv.id)));
                                } else {
                                  setSelectedInvoices(new Set());
                                }
                              }}
                            />
                          </th>
                          <th className="text-left p-2">Invoice #</th>
                          <th className="text-left p-2">Client</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-right p-2">Total</th>
                          <th className="text-center p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceHistory.map((inv) => (
                          <tr key={inv.id} className={`border-b hover:bg-gray-50 ${selectedInvoices.has(inv.id) ? 'bg-indigo-50/50' : ''}`}>
                            <td className="p-2">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedInvoices.has(inv.id)}
                                onChange={(e) => {
                                  const next = new Set(selectedInvoices);
                                  if (e.target.checked) { next.add(inv.id); } else { next.delete(inv.id); }
                                  setSelectedInvoices(next);
                                }}
                              />
                            </td>
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

                  {/* Floating Bulk Action Bar */}
                  {selectedInvoices.size > 0 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-between text-white shadow-lg">
                      <span className="text-sm font-medium">
                        {selectedInvoices.size} invoice{selectedInvoices.size > 1 ? 's' : ''} selected
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={bulkActionLoading !== null}
                          onClick={async () => {
                            setBulkActionLoading('send-reminders');
                            try {
                              const res = await fetch('/api/invoices/bulk', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'send-reminders', invoiceIds: Array.from(selectedInvoices) }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                toast.success(`Reminders sent: ${data.results.sent} success, ${data.results.failed} failed`);
                                setSelectedInvoices(new Set());
                              } else { toast.error(data.error || 'Failed'); }
                            } catch { toast.error('Error sending reminders'); }
                            setBulkActionLoading(null);
                          }}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {bulkActionLoading === 'send-reminders' ? 'Sending...' : '📧 Send Reminders'}
                        </button>
                        <button
                          disabled={bulkActionLoading !== null}
                          onClick={async () => {
                            setBulkActionLoading('mark-paid');
                            try {
                              const res = await fetch('/api/invoices/bulk', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'mark-paid', invoiceIds: Array.from(selectedInvoices) }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                toast.success(`${data.results.updated} invoice(s) marked as paid`);
                                setSelectedInvoices(new Set());
                                if (typeof window !== 'undefined') window.location.reload();
                              } else { toast.error(data.error || 'Failed'); }
                            } catch { toast.error('Error marking as paid'); }
                            setBulkActionLoading(null);
                          }}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {bulkActionLoading === 'mark-paid' ? 'Updating...' : '✅ Mark Paid'}
                        </button>
                        <button
                          disabled={bulkActionLoading !== null}
                          onClick={async () => {
                            setBulkActionLoading('export-csv');
                            try {
                              const res = await fetch('/api/invoices/bulk', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'export-csv', invoiceIds: Array.from(selectedInvoices) }),
                              });
                              if (res.ok) {
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('CSV exported!');
                                setSelectedInvoices(new Set());
                              } else { toast.error('Export failed'); }
                            } catch { toast.error('Error exporting'); }
                            setBulkActionLoading(null);
                          }}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {bulkActionLoading === 'export-csv' ? 'Exporting...' : '📥 Export CSV'}
                        </button>
                        <button
                          onClick={() => setSelectedInvoices(new Set())}
                          className="px-2 py-1.5 hover:bg-white/20 rounded-lg text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
            {/* Right Sidebar - Tools & Settings */}
            <div className="w-full xl:w-80 shrink-0 space-y-6 xl:sticky xl:top-8 order-2 xl:order-2 h-fit">
              {/* Action Buttons */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="group w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all duration-300"
                >
                  <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  disabled={!invoice.id}
                  className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4" />
                  Send via Email
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Share via WhatsApp
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      setShowLoginPrompt(true);
                    } else {
                      handleSaveInvoice();
                    }
                  }}
                  className="w-full py-3 px-4 bg-theme-primary hover:opacity-90 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-theme-primary/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Save Invoice
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex-1 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs transition-colors"
                  >
                    History {invoiceHistory.length > 0 && `(${invoiceHistory.length})`}
                  </button>
                  <button
                    onClick={handleNewInvoice}
                    className="flex-1 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs transition-colors"
                  >
                    + New
                  </button>
                </div>

                {/* Templates */}
                {user && (
                  <div className="flex gap-2 relative">
                    <button
                      onClick={handleSaveAsTemplate}
                      disabled={savingTemplate}
                      className="flex-1 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {savingTemplate ? 'Saving...' : 'Save Template'}
                    </button>
                    <div className="relative flex-1">
                      <button
                        onClick={() => {
                          if (!showTemplateDropdown) loadTemplates();
                          setShowTemplateDropdown(!showTemplateDropdown);
                        }}
                        className="w-full py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Templates
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showTemplateDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {templates.length > 0 ? (
                            templates.map((tpl: any) => (
                              <button
                                key={tpl.id}
                                onClick={() => handleLoadTemplate(tpl.id)}
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-xs"
                              >
                                <div className="font-medium text-gray-800">{tpl.name}</div>
                                <div className="text-gray-400 mt-0.5">
                                  {tpl.currency} • Used {tpl.usageCount}x
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-xs text-gray-400 text-center">
                              No templates saved yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Settings</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color Theme</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['slate', 'blue', 'green', 'purple', 'red'].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateField('theme', t as Theme)}
                        className={`h-8 rounded-full border-2 transition-all ${invoice.theme === t ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: `var(--color-${t}-500, ${t === 'slate' ? '#64748b' : t === 'blue' ? '#3b82f6' : t === 'green' ? '#22c55e' : t === 'purple' ? '#a855f7' : '#ef4444'})` }}
                        title={t.charAt(0).toUpperCase() + t.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                  <select
                    value={invoice.currency}
                    onChange={(e) => updateField('currency', e.target.value as Currency)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary"
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

                {/* Mini Theme Preview */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Theme Preview</label>
                    <button
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                      Zoom
                    </button>
                  </div>
                  <div
                    className="w-full aspect-[210/297] bg-white rounded border border-gray-200 shadow-sm relative overflow-hidden p-3 flex flex-col gap-2 cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all"
                    onClick={() => setIsPreviewModalOpen(true)}
                  >
                    {/* Brand Stripe */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-theme-primary opacity-80"></div>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-2 mt-1">
                      {invoice.company?.logo ? (
                        <img src={invoice.company.logo} className="w-8 h-8 object-contain" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[6px] text-gray-400">Logo</div>
                      )}
                      <div className="text-[6px] text-right">
                        <div className="font-bold text-gray-900">{invoice.invoiceNumber || '#'}</div>
                        <div className="text-gray-500">{invoice.invoiceDate || 'Date'}</div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2 mb-2">
                        <div className="w-1/2">
                          <div className="text-[5px] font-bold text-gray-400 uppercase mb-0.5">FROM</div>
                          <div className="text-[6px] font-bold text-gray-800 truncate">{invoice.company?.name || 'Company'}</div>
                        </div>
                        <div className="w-1/2">
                          <div className="text-[5px] font-bold text-gray-400 uppercase mb-0.5">TO</div>
                          <div className="text-[6px] font-bold text-gray-800 truncate">{invoice.client?.name || 'Client'}</div>
                        </div>
                      </div>

                      {/* Mini Items Table */}
                      <div className="w-full">
                        <div className="bg-gray-50 p-1 mb-0.5 flex justify-between">
                          <div className="w-1/2 text-[4px] font-bold text-gray-500">ITEM</div>
                          <div className="w-1/4 text-[4px] font-bold text-gray-500 text-right">AMT</div>
                        </div>
                        {(invoice.lineItems || []).slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between py-0.5 border-b border-gray-50">
                            <div className="w-1/2 text-[4px] text-gray-700 truncate">{item.description || 'Item'}</div>
                            <div className="w-1/4 text-[4px] text-gray-700 text-right">{formatCurrency((item.quantity || 0) * (item.rate || 0), invoice.currency || 'NGN')}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Totals */}
                    <div className="flex justify-end mt-auto">
                      <div className="w-2/3 space-y-0.5">
                        <div className="flex justify-between text-[5px] text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatCurrency(invoice.subtotal || 0, invoice.currency || 'NGN')}</span>
                        </div>
                        <div className="flex justify-between text-[5px] text-gray-600">
                          <span>Tax</span>
                          <span>{formatCurrency(invoice.taxAmount || 0, invoice.currency || 'NGN')}</span>
                        </div>
                        <div className="h-px bg-gray-200 my-0.5"></div>
                        <div className="flex justify-between text-[6px] font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatCurrency(invoice.total || 0, invoice.currency || 'NGN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Link - Premium */}
                {isPremium && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Link</label>
                      {!invoice.paymentLink && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Premium</span>}
                    </div>
                    {invoice.paymentLink ? (
                      <div className="flex gap-2">
                        <input type="text" readOnly value={invoice.paymentLink} className="w-full text-xs bg-gray-50 border-gray-200 rounded px-3 py-2 truncate" />
                        <button onClick={() => { navigator.clipboard.writeText(invoice.paymentLink || ''); toast.success('Copied!'); }} className="text-xs font-bold text-indigo-600">Copy</button>
                      </div>
                    ) : (
                      <button onClick={async () => {
                        if (!invoice.id) { toast.error('Save invoice first'); return; }
                        const link = await generatePaymentLinkAPI(invoice.id, 'paystack');
                        setInvoice(prev => ({ ...prev, paymentLink: link }));
                      }} className="w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                        Generate Link
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>


            <div className="flex-1 w-full max-w-[120rem] order-1 xl:order-1">
              <div className="bg-white p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h2 className="text-lg font-semibold text-gray-700">Preview</h2>
                  <div className="text-xs text-gray-500">Auto-updates as you type</div>
                </div>

                {/* Invoice Paper */}
                <div className="bg-white rounded-lg shadow-xl ring-1 ring-black/5 p-2 sm:p-10 min-h-[600px] relative transition-all duration-300">
                  {/* Ribbon/Accent Top (Optional - adds nice touch based on theme) */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-theme-primary rounded-t-lg opacity-80"></div>

                  {/* Header Section - Split Layout */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 mt-2">
                    {/* Left: Company BRAND */}
                    <div className="flex-1 w-full max-w-sm">
                      <div className="mb-6 group/logo relative w-fit">
                        {invoice.company?.logo ? (
                          <div className="relative">
                            <img
                              src={invoice.company.logo}
                              alt="Company logo"
                              className="h-16 object-contain"
                            />
                            <button
                              onClick={() => updateField('company.logo', '')}
                              className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover/logo:opacity-100 transition-all hover:bg-red-200"
                              title="Remove logo"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <ImageUpload
                            currentImage={invoice.company?.logo}
                            onImageUpload={(url) => updateField('company.logo', url)}
                            label="Upload Logo"
                          />
                        )}
                      </div>

                      <div className="px-2 -mx-2 hover:bg-gray-50 rounded transition-colors group/company relative">
                        <div className="flex justify-between items-center group-hover/company:opacity-100 opacity-0 transition-opacity absolute top-2 right-2 z-10">
                          <button
                            onClick={() => setAddressModes(prev => ({ ...prev, company: prev.company === 'simple' ? 'detailed' : 'simple' }))}
                            className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded"
                          >
                            {addressModes.company === 'simple' ? 'Edit Details' : 'Simple View'}
                          </button>
                        </div>

                        <input
                          type="text"
                          value={invoice.company?.name || ''}
                          onChange={(e) => updateField('company.name', e.target.value)}
                          className="w-full text-2xl font-bold text-gray-900 tracking-tight bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300 mb-2"
                          placeholder="Your Company Name"
                        />

                        {addressModes.company === 'simple' ? (
                          <textarea
                            value={
                              // Construct address string if empty, or use existing
                              invoice.company?.address || ''
                            }
                            onChange={(e) => {
                              // For simple mode, we basically just dump everything into address line 1 for now, 
                              // or we could parse it? For this implementation, let's treat 'address' as the full block when in simple mode
                              // But to avoid losing data, typically we'd map this to a specific field. 
                              // User request implies "1 big text area". 
                              // Let's map it to 'address' field.
                              updateField('company.address', e.target.value);
                            }}
                            className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300 text-sm min-h-[80px]"
                            placeholder="Address, City, State, Zip, Country..."
                          />
                        ) : (
                          <div className="space-y-1 text-sm text-gray-500">
                            <input
                              type="text"
                              value={invoice.company?.address || ''}
                              onChange={(e) => updateField('company.address', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300"
                              placeholder="Address Line 1"
                            />
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={invoice.company?.city || ''}
                                onChange={(e) => updateField('company.city', e.target.value)}
                                className="min-w-0 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300"
                                placeholder="City"
                              />
                              <span>,</span>
                              <input
                                type="text"
                                value={invoice.company?.state || ''}
                                onChange={(e) => updateField('company.state', e.target.value)}
                                className="min-w-0 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300"
                                placeholder="State"
                              />
                              <input
                                type="text"
                                value={invoice.company?.zip || ''}
                                onChange={(e) => updateField('company.zip', e.target.value)}
                                className="min-w-0 w-20 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300"
                                placeholder="Zip"
                              />
                            </div>
                            <input
                              type="text"
                              value={invoice.company?.country || ''}
                              onChange={(e) => updateField('company.country', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300"
                              placeholder="Country"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Invoice Meta & Title */}
                    <div className="text-right flex-1 w-full relative">
                      {/* Document Type Selector */}
                      <div className="absolute -top-10 right-0 z-10 flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm text-xs font-medium">
                        <button
                          onClick={() => updateField('type', 'invoice')}
                          className={`px-3 py-1.5 transition-colors ${(!invoice.type || invoice.type === 'invoice') ? 'bg-theme-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          Invoice
                        </button>
                        <button
                          onClick={() => updateField('type', 'estimate')}
                          className={`px-3 py-1.5 border-l border-r border-gray-200 transition-colors ${invoice.type === 'estimate' ? 'bg-amber-500 text-white border-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          Estimate
                        </button>
                        <button
                          onClick={() => updateField('type', 'credit_note')}
                          className={`px-3 py-1.5 transition-colors ${invoice.type === 'credit_note' ? 'bg-rose-500 text-white border-rose-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          Credit Note
                        </button>
                      </div>

                      <h1 className="text-4xl font-light text-gray-300 tracking-widest uppercase mb-6 mt-4">
                        {invoice.type === 'estimate' ? 'Estimate' : invoice.type === 'credit_note' ? 'Credit Note' : 'Invoice'}
                      </h1>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 sm:gap-4 group/meta hover:bg-gray-50 p-1 -mr-1 rounded">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Number</label>
                          <div className="flex flex-col items-end w-full sm:w-auto">
                            <input
                              type="text"
                              value={invoice.invoiceNumber || ''}
                              onChange={(e) => updateField('invoiceNumber', e.target.value)}
                              className="text-right font-semibold text-gray-900 font-mono bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm w-full sm:w-32 placeholder:text-gray-300"
                              placeholder="#"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 sm:gap-4 group/meta hover:bg-gray-50 p-1 -mr-1 rounded">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Date</label>
                          <input
                            type="date"
                            value={invoice.invoiceDate || ''}
                            onChange={(e) => updateField('invoiceDate', e.target.value)}
                            className="text-right font-medium text-gray-900 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm w-full sm:w-36"
                          />
                        </div>
                        {invoice.type !== 'credit_note' && (
                          <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 sm:gap-4 group/meta hover:bg-gray-50 p-1 -mr-1 rounded">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              {invoice.type === 'estimate' ? 'Valid Until' : 'Due'}
                            </label>
                            <input
                              type="date"
                              value={invoice.dueDate || ''}
                              onChange={(e) => updateField('dueDate', e.target.value)}
                              className="text-right font-medium text-gray-900 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm w-full sm:w-36"
                            />
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 sm:gap-4 group/meta hover:bg-gray-50 p-1 -mr-1 rounded">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">PO #</label>
                          <input
                            type="text"
                            value={invoice.purchaseOrder || ''}
                            onChange={(e) => updateField('purchaseOrder', e.target.value)}
                            className="text-right font-medium text-gray-900 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm w-full sm:w-32 placeholder:text-gray-300"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Header: Bill To & Ship To */}
                  <div className="flex flex-col sm:flex-row gap-12 mb-12">
                    <div className="flex-1 relative group/billto">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bill To</h4>
                        <button
                          onClick={() => setAddressModes(prev => ({ ...prev, client: prev.client === 'simple' ? 'detailed' : 'simple' }))}
                          className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded opacity-0 group-hover/billto:opacity-100 transition-opacity"
                        >
                          {addressModes.client === 'simple' ? 'Edit Details' : 'Simple View'}
                        </button>
                      </div>
                      <div className="space-y-1 rounded -mx-2 px-2 hover:bg-gray-50 transition-colors">
                        <input
                          type="text"
                          value={invoice.client?.name || ''}
                          onChange={(e) => updateField('client.name', e.target.value)}
                          className="w-full text-lg font-semibold text-gray-900 bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300 mb-2"
                          placeholder="Client Name"
                        />

                        {addressModes.client === 'simple' ? (
                          <textarea
                            value={invoice.client?.address || ''}
                            onChange={(e) => updateField('client.address', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm placeholder:text-gray-300 text-sm min-h-[80px]"
                            placeholder="Address, City, State, Zip, Country..."
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <input
                              type="text"
                              value={invoice.client?.city || ''}
                              onChange={(e) => updateField('client.city', e.target.value)}
                              placeholder="City"
                              className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm"
                            />
                            <input
                              type="text"
                              value={invoice.client?.state || ''}
                              onChange={(e) => updateField('client.state', e.target.value)}
                              placeholder="State/Province"
                              className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm"
                            />
                            <input
                              type="text"
                              value={invoice.client?.zip || ''}
                              onChange={(e) => updateField('client.zip', e.target.value)}
                              placeholder="Zip/Postal"
                              className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm"
                            />
                            <input
                              type="text"
                              value={invoice.client?.country || ''}
                              onChange={(e) => updateField('client.country', e.target.value)}
                              placeholder="Country"
                              className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-8">
                    <LineItems
                      lineItems={invoice.lineItems || []}
                      onUpdate={(items) => updateField('lineItems', items)}
                      currency={invoice.currency || 'NGN'}
                      currencySymbol={currencySymbols[invoice.currency || 'NGN']}
                    />
                  </div>

                  {/* Totals Section */}
                  <div className="flex justify-end mb-12">
                    <div className="w-full sm:w-1/2 lg:w-5/12 space-y-3">
                      {/* Subtotal */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">
                          {currencySymbol} {formatCurrency(invoice.subtotal || 0, invoice.currency || 'NGN')}
                        </span>
                      </div>

                      {/* Discount */}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Discount</span>
                          <input
                            type="number"
                            value={invoice.discountRate || 0}
                            onChange={(e) => updateField('discountRate', parseFloat(e.target.value) || 0)}
                            className="w-16 text-right bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-theme-primary shadow-sm"
                            placeholder="0"
                            min="0"
                          />
                          <span className="text-gray-400">%</span>
                        </div>
                        <span className="text-red-500">
                          -{currencySymbol} {formatCurrency(invoice.discountAmount || 0, invoice.currency || 'NGN')}
                        </span>
                      </div>

                      {/* Tax */}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Tax</span>
                          <input
                            type="number"
                            value={invoice.taxRate || 0}
                            onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                            className="w-16 text-right bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-theme-primary shadow-sm"
                            placeholder="0"
                            min="0"
                          />
                          <span className="text-gray-400">%</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {currencySymbol} {formatCurrency(invoice.taxAmount || 0, invoice.currency || 'NGN')}
                        </span>
                      </div>

                      {/* Shipping */}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{currencySymbol}</span>
                          <input
                            type="number"
                            value={invoice.shipping || 0}
                            onChange={(e) => updateField('shipping', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-theme-primary shadow-sm"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Total Due */}
                      <div className="border-t-2 border-gray-900 pt-4 mt-4 flex justify-between items-end">
                        <span className="text-base font-bold text-gray-900 uppercase tracking-wider">Total Due</span>
                        <span className="text-2xl font-bold text-theme-primary">
                          {currencySymbol} {formatCurrency(invoice.total || 0, invoice.currency || 'NGN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details / Bank Info</h4>
                      <textarea
                        value={invoice.bankDetails || ''}
                        onChange={(e) => updateField('bankDetails', e.target.value)}
                        className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary placeholder:text-gray-300 min-h-[80px]"
                        placeholder="Add bank details, payment instructions..."
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h4>
                      <textarea
                        value={invoice.notes || ''}
                        onChange={(e) => updateField('notes', e.target.value)}
                        className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary placeholder:text-gray-300 min-h-[80px]"
                        placeholder="Add notes, thank you message..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                      <textarea
                        value={invoice.terms || ''}
                        onChange={(e) => updateField('terms', e.target.value)}
                        className="w-full text-xs text-gray-500 bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary placeholder:text-gray-300 min-h-[60px]"
                        placeholder="Add terms and conditions, late fees, etc..."
                      />
                    </div>

                    <div className="sm:col-span-2 relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/60 mt-2">
                      <div className="mb-3 sm:mb-0">
                        <h4 className="text-sm font-bold text-gray-800">Remove PDF Watermark</h4>
                        <p className="text-xs text-gray-500 mt-1">Hide the "Created with invoicegenerator.ng" branding from your downloaded PDFs.</p>
                      </div>
                      <div className="relative">
                        <label className={`relative inline-flex items-center ${isPremium ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={invoice.hideWatermark || false}
                            disabled={!isPremium}
                            onChange={(e) => updateField('hideWatermark', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-primary"></div>
                        </label>
                        {!isPremium && (
                          <Link href="/pricing" className="absolute -top-6 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold rounded uppercase tracking-wider shadow-sm items-center gap-1 flex whitespace-nowrap hover:from-amber-500 hover:to-amber-600 transition-all">
                            PRO
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment History Section (Outside the paper) */}
                  {
                    !!invoice.id && (
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
                                toast.error('Failed to load payment history: ' + error.message);
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
                                      <span className={`px-3 py-2 text-xs font-semibold rounded ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                            {invoice.paymentStatus !== 'paid' && !!invoice.id && !!invoice.total && (
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
                                      toast.success('Payment recorded successfully!');
                                    } catch (error: any) {
                                      toast.error('Failed to record payment: ' + error.message);
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
                    )
                  }

                  {/* Activity Timeline */}
                  {!!invoice.id && (emailActivity.length > 0 || invoice.sentAt || invoice.viewedAt || (invoice.remindersSent && Object.keys(invoice.remindersSent).length > 0)) && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700">Activity Timeline</h3>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="space-y-3">

                          {/* Automated Reminders */}
                          {invoice.remindersSent && Object.entries(invoice.remindersSent).map(([trigger, timestamp]) => (
                            <div key={`reminder-${trigger}`} className="flex items-start gap-3">
                              <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">🤖</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Automated reminder sent</p>
                                <p className="text-xs text-gray-500 truncate">
                                  Trigger: {trigger.replace(/_/g, ' ')} • {format(new Date(timestamp as string), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          ))}
                          {/* Sent Events */}
                          {emailActivity.map((log: any) => (
                            <div key={log.id} className="flex items-start gap-3">
                              <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">📤</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Invoice emailed</p>
                                <p className="text-xs text-gray-500 truncate">
                                  To: {log.to} • {format(new Date(log.sentAt), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {log.status}
                              </span>
                            </div>
                          ))}

                          {/* Opened Events */}
                          {emailActivity.filter((log: any) => log.openedAt).map((log: any) => (
                            <div key={`opened-${log.id}`} className="flex items-start gap-3">
                              <div className="mt-0.5 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">📬</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Email opened</p>
                                <p className="text-xs text-gray-500">
                                  By {log.to} • {format(new Date(log.openedAt), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Viewed Event (from pay page) */}
                          {invoice.viewedAt && (
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">👁️</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Invoice viewed</p>
                                <p className="text-xs text-gray-500">
                                  Client viewed the invoice • {format(new Date(invoice.viewedAt), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Paid Event */}
                          {invoice.paymentStatus === 'paid' && invoice.paymentDate && (
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">💰</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Payment received</p>
                                <p className="text-xs text-gray-500">
                                  Full payment • {format(new Date(invoice.paymentDate), 'MMM dd, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* No activity yet */}
                          {emailActivity.length === 0 && !invoice.viewedAt && (
                            <p className="text-sm text-gray-400 text-center py-2">No activity recorded yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Link Section - Premium Only */}
                  {
                    isPremium && invoice.total && invoice.total > 0 && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-indigo-100/50 shadow-sm backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          </div>
                          <h3 className="text-base font-bold text-gray-900">Online Payment Link</h3>
                        </div>

                        {invoice.paymentLink ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={invoice.paymentLink}
                                className="flex-1 px-4 py-3 text-sm border border-indigo-200 rounded-xl bg-white/80 font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(invoice.paymentLink || '');
                                  toast.success('Payment link copied to clipboard!');
                                }}
                                className="px-6 py-3 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300"
                              >
                                Copy
                              </button>
                            </div>
                            <div className="flex justify-between items-center pt-2 px-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Provider: <span className="text-gray-900 capitalize">{invoice.paymentProvider || 'Default'}</span></span>
                              <div className="flex gap-4">
                                <button onClick={async () => {
                                  if (!user || !invoice.id) return;
                                  try {
                                    const link = await generatePaymentLinkAPI(invoice.id, 'paypal');
                                    setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paypal' }));
                                    toast.success('PayPal payment link updated!');
                                  } catch (error: any) { toast.error(error.message); }
                                }} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">Use PayPal</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={async () => {
                                  if (!user || !invoice.id) return;
                                  try {
                                    const link = await generatePaymentLinkAPI(invoice.id, 'paystack');
                                    setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paystack' }));
                                    toast.success('Paystack payment link updated!');
                                  } catch (error: any) { toast.error(error.message); }
                                }} className="text-xs font-bold text-green-600 hover:text-green-800 hover:underline transition-colors">Use Paystack</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              Create a secure payment link for your client to pay online instantly.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={async () => {
                                  if (!user || !invoice.total || !invoice.id) { toast.error('Please save the invoice first'); return; }
                                  try {
                                    const link = await generatePaymentLinkAPI(invoice.id, 'paypal');
                                    setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paypal' }));
                                  } catch (error: any) { toast.error(error.message); }
                                }}
                                className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all"
                              >
                                Create PayPal Link
                              </button>
                              <button
                                onClick={async () => {
                                  if (!user || !invoice.total || !invoice.id) { toast.error('Please save the invoice first'); return; }
                                  try {
                                    const link = await generatePaymentLinkAPI(invoice.id, 'paystack');
                                    setInvoice(prev => ({ ...prev, paymentLink: link, paymentProvider: 'paystack' }));
                                  } catch (error: any) { toast.error(error.message); }
                                }}
                                className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-green-500 hover:text-green-600 hover:shadow-md transition-all"
                              >
                                Create Paystack Link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                </div >

                {/* Payment Methods Not Configured Message */}
                {
                  isPremium && invoice.total && invoice.total > 0 && !invoice.paymentLink && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200/60 rounded-xl mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-amber-900 mb-1">Connect Payment Methods</h4>
                          <p className="text-xs text-amber-700 mb-2">
                            To automatically generate payment links for your invoices, connect your payment gateway in Settings.
                          </p>
                          <Link
                            href="/settings/payment-methods"
                            className="inline-block text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
                          >
                            Go to Payment Methods Settings →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                }


              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Modal */}
      {
        showClientModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" style={{ margin: 0 }}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Add New Client</h3>
              </div>
              <div className="overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    placeholder="Enter client name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={newClient.city}
                      onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={newClient.state}
                      onChange={(e) => setNewClient({ ...newClient, state: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      ZIP/Postal
                    </label>
                    <input
                      type="text"
                      value={newClient.zip}
                      onChange={(e) => setNewClient({ ...newClient, zip: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={newClient.country}
                      onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newClient.name) {
                      toast.error('Client name is required');
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
                      toast.error('Failed to create client: ' + (error.message || 'Unknown error'));
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-theme-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-theme-primary/20"
                >
                  Save Client
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Preview Zoom Modal */}
      {
        isPreviewModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" style={{ margin: 0 }}>
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsPreviewModalOpen(false)}
            ></div>
            <div className="relative bg-gray-100 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
                <h3 className="text-lg font-bold text-gray-800">Invoice Preview</h3>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-100 flex justify-center">
                <div className="w-full max-w-[210mm] shadow-2xl origin-top transform-gpu">
                  <InvoicePaper
                    invoice={invoice}
                    isEditable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Email Modal */}
      {
        isEmailModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" style={{ margin: 0 }}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Send Invoice via Email</h3>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={invoice.client?.email || ''}
                    onChange={(e) => updateField('client', { ...invoice.client, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all shadow-sm"
                    placeholder="client@example.com"
                  />
                </div>
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2 items-start">
                  <span className="mt-0.5">ℹ️</span>
                  <p>The invoice PDF will be attached to this email along with a standard message.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!invoice.client?.email) {
                      toast.error('Please enter a recipient email address.');
                      return;
                    }
                    if (!invoice.id) {
                      toast.error('Please save the invoice first.');
                      return;
                    }

                    setSendingEmail(true);
                    try {
                      await sendInvoiceEmailAPI(
                        invoice.id,
                        invoice.client.email,
                        `Please find your invoice ${invoice.invoiceNumber || 'N/A'} attached.${invoice.paymentLink ? `\n\nPay online: ${invoice.paymentLink}` : ''} `
                      );
                      toast.success('Invoice sent successfully!');
                      setIsEmailModalOpen(false);
                    } catch (error: any) {
                      toast.error('Failed to send invoice: ' + error.message);
                    } finally {
                      setSendingEmail(false);
                    }
                  }}
                  disabled={sendingEmail}
                  className="flex-1 px-4 py-3 bg-theme-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-theme-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Sending...' : 'Send Invoice'}
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" style={{ margin: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Your Invoice</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Create a free account or log in to save your invoices, track payments, email clients, and access your invoice history from anywhere.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/register"
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-colors text-center"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors text-center"
                >
                  Log In
                </Link>
              </div>
            </div>
            <div className="px-8 pb-6">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Guest Post-Download Modal */}
      {showGuestPostDownloadModal && !user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all" style={{ margin: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {guestEmailStep === 1 ? (
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Want a copy in your inbox?</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  Your invoice has been downloaded, but <strong>not saved</strong>. Enter your email to get a copy, or <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">create an account</Link> to save, track, and manage all your invoices in one place!
                </p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!guestEmail) return;
                  setGuestEmailLoading(true);
                  try {
                    const res = await fetch('/api/public/send-copy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        invoiceId: invoice.id,
                        email: guestEmail,
                        subscribeToBrevo: true // auto-subscribe as requested by prompt
                      })
                    });
                    if (res.ok) {
                      setGuestEmailStep(2);
                    } else {
                      const data = await res.json();
                      toast.error(data.error || 'Failed to send copy');
                    }
                  } catch (err) {
                    toast.error('Something went wrong. Please try again.');
                  } finally {
                    setGuestEmailLoading(false);
                  }
                }}>
                  <div className="mb-4">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guestEmailLoading || !guestEmail}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    {guestEmailLoading ? 'Sending...' : 'Send Invoice to Email'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowGuestPostDownloadModal(false)}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    No thanks, I'm good
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sent Successfully!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Your invoice copy is on its way to {guestEmail}.
                  <br /><br />
                  <span className="font-medium text-gray-800">Did you know?</span> By creating a free account, you can save clients, track payments, and never lose an invoice again.
                </p>

                <Link
                  href="/auth/register"
                  className="block w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-colors mb-3"
                >
                  Create Free Account
                </Link>

                <button
                  onClick={() => setShowGuestPostDownloadModal(false)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Free Plan Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-5 transform rotate-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Limit Reached</h3>
              <p className="text-sm text-gray-500 mb-6">
                You have reached the 15 invoice limit for your Free Plan this month. To continue generating unlimited invoices, securely sending via WhatsApp, and tracking payments, please upgrade to Premium.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/upgrade"
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Upgrade to Premium
                </Link>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SendEmailModal
        invoiceId={invoice.id || ''}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        defaultEmail={invoice.client?.email || ''}
      />
    </>
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
