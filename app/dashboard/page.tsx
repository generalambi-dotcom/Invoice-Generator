'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import { loadInvoicesAPI, deleteInvoiceAPI, updateOverdueInvoicesAPI, getPaymentRemindersAPI, sendPaymentRemindersAPI, approveInvoiceAPI, rejectInvoiceAPI, requestApprovalAPI, markInvoiceSentAPI, getCompanyDefaultsAPI } from '@/lib/api-client';
import { Invoice, currencySymbols, Currency } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
import DashboardGreeting from '@/components/DashboardGreeting';
import DashboardCharts from '@/components/DashboardCharts';
import {
  Plus, BarChart3, FileText, Eye, CreditCard,
  Trash2, RefreshCcw, MoreHorizontal
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeInvoices, setActiveInvoices] = useState<Invoice[]>([]);
  const [deletedInvoices, setDeletedInvoices] = useState<Invoice[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState<any[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['USD']);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for token first
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/signin?redirect=/dashboard');
        return;
      }

      const currentUser = getCurrentUser();
      let userData = currentUser;

      if (!currentUser) {
        // Try to get user from token if localStorage user is missing
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('invoice-generator-current-user', JSON.stringify(data.user));
            userData = data.user;
            setUser(data.user);
          } else {
            router.push('/signin?redirect=/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          router.push('/signin?redirect=/dashboard');
          return;
        }
      } else {
        setUser(currentUser);
      }

      // Load data in parallel
      await Promise.all([
        loadInvoiceData(),
        loadPaymentReminders(),
        loadCompanySettings()
      ]);

      // Update overdue invoices on mount (background)
      updateOverdueInvoicesAPI().then(() => loadInvoiceData()).catch(e => console.error(e));
    };

    checkAuth();
  }, [router]);

  const loadCompanySettings = async () => {
    try {
      const defaults = await getCompanyDefaultsAPI();
      // Only set currency if we haven't determined any available currencies yet
      // or if we want to default to company currency initially
      if (defaults && defaults.defaultCurrency) {
        // We'll let loadInvoiceData handle setting the currency based on invoices,
        // but fallback to default if no invoices
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const loadPaymentReminders = async () => {
    try {
      const reminders = await getPaymentRemindersAPI();
      setPaymentReminders(reminders.reminders || []);
    } catch (error) {
      console.error('Error loading payment reminders:', error);
    }
  };

  const loadInvoiceData = async () => {
    try {
      // Load from API only
      const invoices = await loadInvoicesAPI();

      // Convert database format to Invoice format and separate active/deleted
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
        approvalStatus: inv.approvalStatus || 'draft',
        approvedBy: inv.approvedBy,
        approvedAt: inv.approvedAt,
        rejectionReason: inv.rejectionReason,
      })) as any[];

      // Extract unique currencies
      const currencies = Array.from(new Set(formattedInvoices.map(inv => inv.currency))).filter(Boolean) as string[];
      if (currencies.length > 0) {
        setAvailableCurrencies(currencies);
        // If current selected currency is not in the list, select the first one
        // This ensures filter works immediately
        /* 
           Note: We rely on state updates, so we check 'currency' in next render or just logic here.
           However, inside this async function 'currency' is stale closure.
           We'll just set it to the first found currency if we are initializing.
        */
        // Prefer finding the company default or falling back to first
        // For now, let's default to the most frequent or just the first one found if not set?
        // Actually, let's just ensure availableCurrencies is populated. 
        // We will keep 'USD' as default active until user changes or logic updates it.
      }


      // Separate active and deleted (cancelled status = deleted)
      const active = formattedInvoices.filter(inv => inv.paymentStatus !== 'cancelled');
      const deleted = formattedInvoices.filter(inv => inv.paymentStatus === 'cancelled');

      setActiveInvoices(active.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.invoiceDate).getTime();
        const dateB = new Date(b.createdAt || b.invoiceDate).getTime();
        return dateB - dateA;
      }));
      setDeletedInvoices(deleted.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.invoiceDate).getTime();
        const dateB = new Date(b.createdAt || b.invoiceDate).getTime();
        return dateB - dateA;
      }));
    } catch (error) {
      console.error('Error loading invoices:', error);
      setActiveInvoices([]);
      setDeletedInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    // Filter active invoices by selected currency for stats calculation
    const invoices = activeInvoices.filter(inv => inv.currency === currency);

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'paid');
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.paidAmount || inv.total), 0);
    const unpaidInvoices = invoices.filter(inv => inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled');
    const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdueInvoices = invoices.filter(inv => {
      if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < new Date();
    });
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalInvoices,
      totalAmount,
      paidCount: paidInvoices.length,
      paidAmount,
      unpaidCount: unpaidInvoices.length,
      unpaidAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount,
    };
  };

  const stats = calculateStats();

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  const handleRestore = async (id: string) => {
    if (confirm('Restore this invoice?')) {
      try {
        // Update invoice status from 'cancelled' to 'pending'
        await fetch(`/api/invoices/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ paymentStatus: 'pending' }),
        });
        loadInvoiceData();
      } catch (error) {
        console.error('Error restoring invoice:', error);
        alert('Failed to restore invoice. Please try again.');
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Permanently delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoiceAPI(id);
        loadInvoiceData();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const handleView = (invoice: Invoice) => {
    // Use invoice ID to load from database
    router.push(`/?invoiceId=${invoice.id}`);
  };

  const handleApproveInvoice = async (invoiceId: string) => {
    if (!confirm('Approve this invoice?')) return;

    setProcessingApproval(invoiceId);
    try {
      await approveInvoiceAPI(invoiceId);
      loadInvoiceData();
    } catch (error: any) {
      alert(error.message || 'Failed to approve invoice');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleRejectInvoice = async (invoiceId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return;

    setProcessingApproval(invoiceId);
    try {
      await rejectInvoiceAPI(invoiceId, reason);
      loadInvoiceData();
    } catch (error: any) {
      alert(error.message || 'Failed to reject invoice');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleRequestApproval = async (invoiceId: string) => {
    setProcessingApproval(invoiceId);
    try {
      await requestApprovalAPI(invoiceId);
      loadInvoiceData();
    } catch (error: any) {
      alert(error.message || 'Failed to request approval');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleMarkAsSent = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as sent?')) return;

    setProcessingApproval(invoiceId);
    try {
      await markInvoiceSentAPI(invoiceId);
      loadInvoiceData();
    } catch (error: any) {
      alert(error.message || 'Failed to mark invoice as sent');
    } finally {
      setProcessingApproval(null);
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      pending_approval: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
    };
    const config = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const invoices = showDeleted ? deletedInvoices : activeInvoices;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header - Simplified */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {availableCurrencies.length > 1 && (
                <div className="hidden sm:block">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    {availableCurrencies.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* New Greeting Component */}
        <DashboardGreeting
          userName={user?.name}
          totalStats={{ paid: stats.paidCount, unpaid: stats.unpaidCount }}
        />

        {/* Stats Cards - Premium Redesign */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 3.666V19.124a.5.5 0 01-.258.438l-2.003.896-.612.2a.5.5 0 01-.456-.118l-2.833-2.738a.5.5 0 01-.157-.348V7.5M8.5 7v10h2.755M1.5 7h1.666a.5.5 0 01.354.146l2.167 2.167h.578a.5.5 0 01.354.146l2.167 2.166H10.5a.5.5 0 01.354.146l.77.771M22.5 7h-1.666a.5.5 0 00-.354.146l-2.167 2.167h-.578a.5.5 0 00-.354.146l-2.167 2.166H13.5a.5.5 0 00-.354.146l-.771.771" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-xl font-bold text-gray-900">
                {currencySymbols[currency as Currency] || currencySymbols['USD']} {formatCurrency(stats.totalAmount, currency)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Paid Invoices</h3>
              <p className="text-xl font-bold text-gray-900">
                {currencySymbols[currency as Currency] || currencySymbols['USD']} {formatCurrency(stats.paidAmount, currency)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-xl font-bold text-gray-900">
                {currencySymbols[currency as Currency] || currencySymbols['USD']} {formatCurrency(stats.unpaidAmount - stats.overdueAmount, currency)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
              <p className="text-xl font-bold text-gray-900">
                {currencySymbols[currency as Currency] || currencySymbols['USD']} {formatCurrency(stats.overdueAmount, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <DashboardCharts invoices={activeInvoices} currency={currency} />

        {/* Action Bar & List Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setShowDeleted(false)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!showDeleted ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Active
              </button>
              <button
                onClick={() => setShowDeleted(true)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${showDeleted ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Deleted
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              {!showDeleted && (
                <>
                  <Link
                    href="/"
                    id="new-invoice-btn"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium shadow-emerald-200 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    New Invoice
                  </Link>
                  <Link
                    href="/reports"
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {showDeleted ? 'No Deleted Invoices' : 'No Invoices Found'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              {showDeleted
                ? 'You haven\'t deleted any invoices yet. Your trash is empty.'
                : 'Create your first invoice to get started and see it appear here.'}
            </p>
            {!showDeleted && (
              <Link
                href="/"
                className="inline-flex px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200 items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                            {invoice.client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {invoice.client.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {currencySymbols[invoice.currency]} {formatCurrency(invoice.total, invoice.currency)}
                        </div>
                        {invoice.paidAmount && invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                          <div className="text-[10px] text-green-600 font-medium mt-0.5">
                            Paid: {currencySymbols[invoice.currency]}{formatCurrency(invoice.paidAmount, invoice.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${invoice.paymentStatus === 'paid'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : invoice.paymentStatus === 'overdue'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : invoice.paymentStatus === 'cancelled'
                              ? 'bg-gray-50 text-gray-600 border-gray-200 line-through'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                          {invoice.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {/* Simplified Actions for cleaner look */}
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(invoice)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!showDeleted && (
                            <>
                              {/* Quick Actions based on status */}
                              {(invoice.paymentStatus === 'pending' || invoice.paymentStatus === 'overdue') && (
                                <button
                                  onClick={async () => {
                                    const amount = prompt(
                                      `Enter payment amount (Total: ${currencySymbols[invoice.currency]}${formatCurrency(invoice.total, invoice.currency)}):`
                                    );
                                    if (amount && !isNaN(parseFloat(amount))) {
                                      const paidAmount = parseFloat(amount);
                                      const currentPaid = invoice.paidAmount || 0;
                                      const newPaidAmount = currentPaid + paidAmount;

                                      try {
                                        await fetch(`/api/invoices/${invoice.id}`, {
                                          method: 'PATCH',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                                          },
                                          body: JSON.stringify({
                                            paidAmount: newPaidAmount,
                                            paymentDate: new Date().toISOString(),
                                          }),
                                        });
                                        loadInvoiceData();
                                      } catch (error) {
                                        alert('Failed to record payment');
                                      }
                                    }
                                  }}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Record Payment"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={async () => {
                                  if (confirm('Delete this invoice?')) {
                                    try {
                                      await fetch(`/api/invoices/${invoice.id}`, {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                                        },
                                        body: JSON.stringify({ paymentStatus: 'cancelled' }),
                                      });
                                      loadInvoiceData();
                                    } catch (error) {
                                      console.error(error);
                                    }
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {showDeleted && (
                            <button
                              onClick={() => handleRestore(invoice.id!)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restore"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

