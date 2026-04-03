'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import { loadInvoicesAPI, deleteInvoiceAPI, updateOverdueInvoicesAPI, getPaymentRemindersAPI, sendPaymentRemindersAPI, approveInvoiceAPI, rejectInvoiceAPI, requestApprovalAPI, markInvoiceSentAPI, getCompanyDefaultsAPI, getUserProfileAPI } from '@/lib/api-client';
import { Invoice, currencySymbols, Currency } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DashboardGreeting from '@/components/DashboardGreeting';
import DashboardCharts from '@/components/DashboardCharts';
import OnboardingModal from '@/components/OnboardingModal';
import ProfileCompletenessCard from '@/components/ProfileCompletenessCard';
import ProfileNudge from '@/components/ProfileNudge';
import {
  Plus, BarChart3, FileText, Eye, CreditCard,
  Trash2, RefreshCcw, MoreHorizontal
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeInvoices, setActiveInvoices] = useState<Invoice[]>([]);
  const [deletedInvoices, setDeletedInvoices] = useState<Invoice[]>([]);
  const [activeEstimates, setActiveEstimates] = useState<Invoice[]>([]);
  const [activeCreditNotes, setActiveCreditNotes] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'estimates' | 'credit_notes'>('invoices');
  const [showDeleted, setShowDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState<any[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['USD']);
  const [profileData, setProfileData] = useState<any>(null);
  const [showNudge, setShowNudge] = useState(true);

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
        loadCompanySettings(),
        loadProfileData()
      ]);

      // Update overdue invoices on mount (background)
      updateOverdueInvoicesAPI().then(() => loadInvoiceData()).catch(e => console.error(e));
    };

    checkAuth();
  }, [router]);

  const loadCompanySettings = async () => {
    try {
      const defaults = await getCompanyDefaultsAPI();
      if (!defaults || Object.keys(defaults).length === 0) {
        setShowOnboarding(true);
      }
      if (defaults && defaults.defaultCurrency) {
        setCurrency(defaults.defaultCurrency);
        setAvailableCurrencies(prev => {
          // If we only have the initial 'USD' and the new default is different, replace it
          if (prev.length === 1 && prev[0] === 'USD' && defaults.defaultCurrency !== 'USD') {
            return [defaults.defaultCurrency];
          }
          // Otherwise, ensure it's included
          if (!prev.includes(defaults.defaultCurrency)) {
            return [...prev, defaults.defaultCurrency];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      const data = await getUserProfileAPI();
      setProfileData(data);
      
      // Check if we should show the nudge (24h cooldown)
      if (data?.user?.lastProfilePrompt) {
        const lastPrompt = new Date(data.user.lastProfilePrompt);
        const hoursSinceLastPrompt = (Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastPrompt < 24) {
          setShowNudge(false);
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
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
        type: inv.type,
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

      // Extract unique currencies and merge with existing
      const invoiceCurrencies = Array.from(new Set(formattedInvoices.map(inv => inv.currency))).filter(Boolean) as string[];
      if (invoiceCurrencies.length > 0) {
        setAvailableCurrencies(prev => {
          const newSet = new Set([...prev, ...invoiceCurrencies]);
          return Array.from(newSet);
        });
      }


      // Separate active and deleted (cancelled status = deleted)
      const active = formattedInvoices.filter(inv => inv.paymentStatus !== 'cancelled' && (!inv.type || inv.type === 'invoice'));
      const activeEst = formattedInvoices.filter(inv => inv.paymentStatus !== 'cancelled' && inv.type === 'estimate');
      const activeCn = formattedInvoices.filter(inv => inv.paymentStatus !== 'cancelled' && inv.type === 'credit_note');
      const deleted = formattedInvoices.filter(inv => inv.paymentStatus === 'cancelled');

      setActiveInvoices(active.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.invoiceDate).getTime();
        const dateB = new Date(b.createdAt || b.invoiceDate).getTime();
        return dateB - dateA;
      }));
      setActiveEstimates(activeEst.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.invoiceDate).getTime();
        const dateB = new Date(b.createdAt || b.invoiceDate).getTime();
        return dateB - dateA;
      }));
      setActiveCreditNotes(activeCn.sort((a, b) => {
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
      setActiveEstimates([]);
      setActiveCreditNotes([]);
      setDeletedInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    // Filter active invoices by selected currency for stats calculation
    const invoices = activeInvoices.filter(inv => inv.currency === currency);

    const now = new Date();
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'paid');
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.paidAmount || inv.total), 0);
    const unpaidInvoices = invoices.filter(inv => inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled');
    const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdueInvoices = invoices.filter(inv => {
      if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < now;
    });
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Due this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const dueThisWeekInvoices = invoices.filter(inv => {
      if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate >= startOfWeek && dueDate < endOfWeek;
    });
    const dueThisWeekAmount = dueThisWeekInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Received this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const receivedThisMonth = paidInvoices.filter(inv => {
      const paidDate = inv.paymentDate ? new Date(inv.paymentDate) : (inv.updatedAt ? new Date(inv.updatedAt) : null);
      if (!paidDate) return false;
      return paidDate >= startOfMonth && paidDate <= endOfMonth;
    });
    const receivedThisMonthAmount = receivedThisMonth.reduce((sum, inv) => sum + (inv.paidAmount || inv.total), 0);

    return {
      totalInvoices,
      totalAmount,
      paidCount: paidInvoices.length,
      paidAmount,
      unpaidCount: unpaidInvoices.length,
      unpaidAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount,
      dueThisWeekCount: dueThisWeekInvoices.length,
      dueThisWeekAmount,
      receivedThisMonthCount: receivedThisMonth.length,
      receivedThisMonthAmount,
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
        toast.error('Failed to restore invoice. Please try again.');
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
        toast.error('Failed to delete invoice. Please try again.');
      }
    }
  };

  const handleView = (invoice: Invoice) => {
    // Navigate to read-only view
    router.push(`/invoice/${invoice.id}`);
  };

  const handleApproveInvoice = async (invoiceId: string) => {
    if (!confirm('Approve this invoice?')) return;

    setProcessingApproval(invoiceId);
    try {
      await approveInvoiceAPI(invoiceId);
      loadInvoiceData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve invoice');
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
      toast.error(error.message || 'Failed to reject invoice');
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
      toast.error(error.message || 'Failed to request approval');
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
      toast.error(error.message || 'Failed to mark invoice as sent');
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

  const invoices = showDeleted
    ? deletedInvoices
    : activeTab === 'estimates'
      ? activeEstimates
      : activeTab === 'credit_notes'
        ? activeCreditNotes
        : activeInvoices;

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
            <div className="flex items-center gap-2 sm:gap-4">
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
              <div className="flex items-center gap-2">
                {/* Inline Burger Menu for Mobile next to Sign Out */}
                <button
                  onClick={() => window.dispatchEvent(new Event('toggleMobileNav'))}
                  className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors bg-gray-50 border border-gray-200"
                  title="Menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
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

        {/* Profile Nudge - contextual suggestion */}
        {showNudge && profileData?.nudge && profileData?.completeness?.score < 100 && (
          <ProfileNudge
            nudge={profileData.nudge}
            score={profileData.completeness.score}
            onDismiss={() => setShowNudge(false)}
          />
        )}

        {/* Profile Completeness - compact card */}
        {profileData?.completeness && profileData.completeness.score < 100 && (
          <div className="mb-6">
            <ProfileCompletenessCard
              score={profileData.completeness.score}
              currentTier={profileData.completeness.currentTier}
              nextTier={profileData.completeness.nextTier}
              missingFields={profileData.completeness.missingFields}
              compact={true}
            />
          </div>
        )}

        {/* Stats Cards - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Outstanding */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[60px] -mr-4 -mt-4"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {currencySymbols[currency as Currency] || currencySymbols['USD']}{formatCurrency(stats.unpaidAmount, currency)}
              </p>
              <p className="text-xs text-gray-400">{stats.unpaidCount} unpaid invoice{stats.unpaidCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Due This Week */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-[60px] -mr-4 -mt-4"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Due This Week</h3>
                {stats.dueThisWeekCount > 0 && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {stats.dueThisWeekCount}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {currencySymbols[currency as Currency] || currencySymbols['USD']}{formatCurrency(stats.dueThisWeekAmount, currency)}
              </p>
              <p className="text-xs text-gray-400">{stats.dueThisWeekCount} invoice{stats.dueThisWeekCount !== 1 ? 's' : ''} due</p>
            </div>
          </div>

          {/* Received This Month */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[60px] -mr-4 -mt-4"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Received This Month</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {currencySymbols[currency as Currency] || currencySymbols['USD']}{formatCurrency(stats.receivedThisMonthAmount, currency)}
              </p>
              <p className="text-xs text-gray-400">{stats.receivedThisMonthCount} payment{stats.receivedThisMonthCount !== 1 ? 's' : ''} received</p>
            </div>
          </div>

          {/* Overdue */}
          <div className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow relative overflow-hidden ${stats.overdueCount > 0 ? 'border-red-200' : 'border-gray-200'
            }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[60px] -mr-4 -mt-4"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
                {stats.overdueCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {stats.overdueCount}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {currencySymbols[currency as Currency] || currencySymbols['USD']}{formatCurrency(stats.overdueAmount, currency)}
              </p>
              <p className="text-xs text-red-400">{stats.overdueCount > 0 ? `${stats.overdueCount} overdue invoice${stats.overdueCount !== 1 ? 's' : ''} — follow up!` : 'No overdue invoices 🎉'}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <DashboardCharts invoices={activeInvoices} currency={currency} />

        {/* Action Bar & List Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-2 sm:mt-0 items-stretch sm:items-center">
            {/* Document Type Tabs */}
            <div className="flex flex-1 sm:flex-none justify-between sm:justify-start bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-hide">
              <button
                onClick={() => { setActiveTab('invoices'); setShowDeleted(false); }}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Invoices
              </button>
              <button
                onClick={() => { setActiveTab('estimates'); setShowDeleted(false); }}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'estimates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Estimates
              </button>
              <button
                onClick={() => { setActiveTab('credit_notes'); setShowDeleted(false); }}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === 'credit_notes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Credit Notes
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-1 sm:flex-none justify-between sm:justify-start bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setShowDeleted(false)}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${!showDeleted ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Active
              </button>
              <button
                onClick={() => setShowDeleted(true)}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${showDeleted ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Deleted
              </button>
            </div>

            <div className="flex gap-2 ml-auto w-full md:w-auto justify-end">
              {!showDeleted && (
                <>
                  <Link
                    href="/free-invoice-generator"
                    id="new-invoice-btn"
                    className="flex-1 md:flex-none justify-center px-3 py-2 md:px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-xs md:text-sm font-medium shadow-emerald-200 shadow-lg whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    New Document
                  </Link>
                  <Link
                    href="/reports"
                    className="px-3 py-2 md:px-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap"
                  >
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
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
                href="/free-invoice-generator"
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
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="hidden sm:table-cell px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-3 md:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-[10px] md:text-xs mr-2 md:mr-3">
                            {invoice.client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-xs md:text-sm font-semibold text-gray-900 max-w-[80px] sm:max-w-[120px] md:max-w-none truncate">
                            {invoice.client.name}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-sm font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded inline-block max-w-[70px] sm:max-w-[100px] md:max-w-none truncate">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-xs md:text-sm font-bold text-gray-900">
                          {currencySymbols[invoice.currency]} {formatCurrency(invoice.total, invoice.currency)}
                        </div>
                        {invoice.paidAmount && invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                          <div className="text-[10px] text-green-600 font-medium mt-0.5">
                            Paid: {currencySymbols[invoice.currency]}{formatCurrency(invoice.paidAmount, invoice.currency)}
                          </div>
                        )}
                        {/* Mobile Status Indicator (dot) since column is hidden on very small screens? No, I hid it on sm but kept on larger. Let's show status icon or color on total? */}
                        <div className="sm:hidden mt-1">
                          <span className={`inline-block w-2 H-2 rounded-full ${invoice.paymentStatus === 'paid' ? 'bg-green-500' : invoice.paymentStatus === 'overdue' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
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
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center">
                        {/* Simplified Actions for cleaner look */}
                        <div className="flex items-center justify-center gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(invoice)}
                            className="p-1 md:p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                        toast.error('Failed to record payment');
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
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal 
          onComplete={() => { setShowOnboarding(false); loadCompanySettings(); }} 
          onSkip={() => setShowOnboarding(false)} 
        />
      )}
    </div>
  );
}

