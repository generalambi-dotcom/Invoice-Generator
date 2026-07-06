'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import { loadInvoicesAPI, deleteInvoiceAPI, updateOverdueInvoicesAPI, getPaymentRemindersAPI, sendPaymentRemindersAPI, approveInvoiceAPI, rejectInvoiceAPI, requestApprovalAPI, markInvoiceSentAPI, getCompanyDefaultsAPI, getUserProfileAPI, getDirectorySettingsAPI } from '@/lib/api-client';
import { Invoice, currencySymbols, Currency } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DashboardGreeting from '@/components/DashboardGreeting';
import DashboardCharts from '@/components/DashboardCharts';
import OnboardingModal from '@/components/OnboardingModal';
import ProfileCompletenessCard from '@/components/ProfileCompletenessCard';
import ProfileNudge from '@/components/ProfileNudge';
import DirectoryOptInModal from '@/components/DirectoryOptInModal';
import DirectorySettingsCard from '@/components/DirectorySettingsCard';
import ActivationChecklist from '@/components/dashboard/ActivationChecklist';
import UsageMeter from '@/components/dashboard/UsageMeter';
import OverdueNudge from '@/components/dashboard/OverdueNudge';
import {
  Plus, BarChart3, FileText, Eye, CreditCard,
  Trash2, RefreshCcw, MoreHorizontal, Sparkles, ArrowRightLeft
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
  const [directorySettings, setDirectorySettings] = useState<any>(null);
  const [directoryMetrics, setDirectoryMetrics] = useState<any>(null);

  // ── Bulk selection ───────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Auth is carried by the httpOnly `auth_token` cookie (not readable by JS).
      // Gate on the cached user profile; if it's missing, verify via /api/auth/me
      // which authenticates from the cookie.
      const currentUser = getCurrentUser();
      let userData = currentUser;

      if (!currentUser) {
        try {
          const response = await fetch('/api/auth/me');
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
        loadProfileData(),
        loadDirectorySettings()
      ]);

      // Update overdue invoices on mount (background)
      updateOverdueInvoicesAPI().then(() => loadInvoiceData()).catch(e => console.error(e));

      // Show post-payment success messages
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success' || params.get('upgrade') === 'success') {
          toast.success('🎉 Payment successful! Your premium subscription is now active.');
          window.history.replaceState({}, '', '/dashboard');
        }
      }
    };

    checkAuth();
  }, [router]);

  // Clear selection whenever the user switches tabs or views
  useEffect(() => { setSelectedIds(new Set()); }, [activeTab, showDeleted]);

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

  const loadDirectorySettings = async () => {
    try {
      const data = await getDirectorySettingsAPI();
      if (data && data.settings) {
        setDirectorySettings(data.settings);
        setDirectoryMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading directory settings:', error);
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
        sentAt: inv.sentAt,
        viewedAt: inv.viewedAt,
        convertedToInvoiceId: inv.convertedToInvoiceId || null,
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

    // ── NEW: Avg payment time (days from invoiceDate to paymentDate) ───────────
    const paidWithDates = paidInvoices.filter(inv => inv.paymentDate && inv.invoiceDate);
    const avgPaymentDays = paidWithDates.length > 0
      ? Math.round(paidWithDates.reduce((sum, inv) => {
          const created = new Date(inv.invoiceDate).getTime();
          const paid = new Date(inv.paymentDate!).getTime();
          return sum + Math.max(0, (paid - created) / (1000 * 60 * 60 * 24));
        }, 0) / paidWithDates.length)
      : null;

    // ── NEW: Month-over-month revenue growth ───────────────────────────────────
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const lastMonthRevenue = paidInvoices
      .filter(inv => {
        const d = inv.paymentDate ? new Date(inv.paymentDate) : (inv.updatedAt ? new Date(inv.updatedAt) : null);
        return d && d >= lastMonthStart && d <= lastMonthEnd;
      })
      .reduce((sum, inv) => sum + (inv.paidAmount || inv.total), 0);
    const momGrowthPct = lastMonthRevenue > 0
      ? Math.round(((receivedThisMonthAmount - lastMonthRevenue) / lastMonthRevenue) * 100)
      : (receivedThisMonthAmount > 0 ? 100 : null);

    // ── NEW: Collection rate (paid invoices / total non-cancelled invoices) ────
    const nonCancelledCount = invoices.filter(inv => inv.paymentStatus !== 'cancelled').length;
    const estimateConversionRate = nonCancelledCount > 0
      ? Math.round((paidInvoices.length / nonCancelledCount) * 100)
      : null;
    const estimateCount = nonCancelledCount;
    const convertedEstimateCount = paidInvoices.length;

    // ── NEW: AR ageing buckets (overdue invoices) ──────────────────────────────
    const ageing = overdueInvoices.reduce((acc, inv) => {
      const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      const amount = inv.total - (inv.paidAmount || 0);
      if (daysOverdue <= 30)       acc.bucket0_30 += amount;
      else if (daysOverdue <= 60)  acc.bucket31_60 += amount;
      else                          acc.bucket61plus += amount;
      return acc;
    }, { bucket0_30: 0, bucket31_60: 0, bucket61plus: 0 });

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
      // Enhanced analytics
      avgPaymentDays,
      momGrowthPct,
      estimateConversionRate,
      estimateCount,
      convertedEstimateCount,
      ageing,
    };
  };

  const stats = calculateStats();

  // ── Activation / premium / get-paid-faster derived state ───────────────────────
  const isPremium =
    user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

  // Documents created in the current calendar month — mirrors the server-side free
  // plan count in app/api/invoices/route.ts (all types/statuses count toward the cap).
  const startOfMonthDate = (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; })();
  const invoicesThisMonth = [
    ...activeInvoices,
    ...activeEstimates,
    ...activeCreditNotes,
    ...deletedInvoices,
  ].filter((doc) => doc.createdAt && new Date(doc.createdAt) >= startOfMonthDate).length;

  const profileScore = profileData?.completeness?.score ?? 0;
  const hasSentInvoice = activeInvoices.some((inv) => !!inv.sentAt);
  const hasPaidInvoice = activeInvoices.some((inv) => inv.paymentStatus === 'paid');

  // Overdue invoices in the currently-selected currency (matches stats.overdueCount).
  const overdueInvoiceList = activeInvoices.filter((inv) => {
    if (inv.currency !== currency) return false;
    if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled') return false;
    return new Date(inv.dueDate) < new Date();
  });

  const handleSendOverdueReminders = () => {
    const ids = overdueInvoiceList.map((inv) => inv.id!).filter(Boolean);
    if (ids.length === 0) return;
    handleBulkAction('send-reminders', ids);
  };

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

  // ── Bulk action helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    if (ids.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkAction = async (action: string, idsOverride?: string[]) => {
    const ids = idsOverride ?? Array.from(selectedIds);
    if (ids.length === 0) return;
    const token = localStorage.getItem('auth_token');

    // Confirmation for destructive actions
    if (action === 'delete' && !confirm(`Delete ${ids.length} invoice${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
    if (action === 'send' && !confirm(`Send ${ids.length} invoice${ids.length > 1 ? 's' : ''} to their clients now?`)) return;

    setBulkLoading(true);
    try {
      if (action === 'export-csv') {
        // CSV export — download directly
        const res = await fetch('/api/invoices/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'export-csv', invoiceIds: ids }),
        });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${ids.length} invoice${ids.length > 1 ? 's' : ''}`);
        clearSelection();
        return;
      }

      const res = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, invoiceIds: ids }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk action failed');

      const r = data.results;
      if (action === 'send') {
        toast.success(`Sent ${r.sent} invoice${r.sent !== 1 ? 's' : ''}${r.failed > 0 ? `, ${r.failed} failed` : ''}`);
      } else if (action === 'mark-paid') {
        toast.success(`Marked ${r.updated} invoice${r.updated !== 1 ? 's' : ''} as paid`);
      } else if (action === 'delete') {
        toast.success(`Deleted ${r.updated} invoice${r.updated !== 1 ? 's' : ''}`);
      } else if (action === 'send-reminders') {
        toast.success(`Sent ${r.sent} reminder${r.sent !== 1 ? 's' : ''}${r.failed > 0 ? `, ${r.failed} failed` : ''}`);
      }

      clearSelection();
      await loadInvoiceData();
    } catch (err: any) {
      toast.error(err.message || 'Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
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

        {/* Directory Modal Flow (Invisible unless needed) */}
        {directorySettings && (
          <DirectoryOptInModal 
            settings={directorySettings} 
            onComplete={(updatedSettings) => setDirectorySettings(updatedSettings)} 
          />
        )}

        {/* New Greeting Component */}
        <DashboardGreeting
          userName={user?.name}
          totalStats={{ paid: stats.paidCount, unpaid: stats.unpaidCount }}
        />

        {/* Activation checklist — guides new users to their first paid invoice */}
        <ActivationChecklist
          profileScore={profileScore}
          hasInvoice={activeInvoices.length > 0}
          hasSentInvoice={hasSentInvoice}
          hasPaidInvoice={hasPaidInvoice}
        />

        {/* Free-plan usage meter + near-limit upgrade nudge */}
        <UsageMeter count={invoicesThisMonth} isPremium={isPremium} />

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

        {/* Directory Settings Card */}
        {directorySettings && directorySettings.hasSeenDirectoryPrompt && (
           <div className="mb-8">
             <DirectorySettingsCard 
               settings={directorySettings} 
               metrics={directoryMetrics} 
               onUpdate={(updated) => setDirectorySettings(updated)} 
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

        {/* Enhanced Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Avg Payment Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Avg Payment Time</h3>
            </div>
            {stats.avgPaymentDays !== null ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.avgPaymentDays} <span className="text-sm font-normal text-gray-400">days</span></p>
                <p className="text-xs text-gray-400">from invoice to payment</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">No paid invoices yet</p>
            )}
          </div>

          {/* MoM Revenue Growth */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${stats.momGrowthPct !== null && stats.momGrowthPct >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Revenue Growth</h3>
            </div>
            {stats.momGrowthPct !== null ? (
              <>
                <p className={`text-2xl font-bold mb-1 ${stats.momGrowthPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.momGrowthPct >= 0 ? '+' : ''}{stats.momGrowthPct}%
                </p>
                <p className="text-xs text-gray-400">vs last month</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">No revenue data yet</p>
            )}
          </div>

          {/* Estimate Conversion Rate */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
            </div>
            {stats.estimateConversionRate !== null ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.estimateConversionRate}<span className="text-sm font-normal text-gray-400">%</span></p>
                <p className="text-xs text-gray-400">{stats.convertedEstimateCount} of {stats.estimateCount} invoices paid</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">No invoices yet</p>
            )}
          </div>

          {/* AR Ageing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">AR Ageing</h3>
            </div>
            {stats.overdueCount > 0 ? (
              <div className="space-y-1.5 mt-1">
                {[
                  { label: '0–30 days', amount: stats.ageing.bucket0_30, color: 'bg-amber-400' },
                  { label: '31–60 days', amount: stats.ageing.bucket31_60, color: 'bg-orange-500' },
                  { label: '60+ days', amount: stats.ageing.bucket61plus, color: 'bg-red-600' },
                ].map(({ label, amount, color }) => (
                  amount > 0 ? (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        {label}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {currencySymbols[currency as Currency] || '$'}{formatCurrency(amount, currency)}
                      </span>
                    </div>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-600 font-medium mt-2">All current ✓</p>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <DashboardCharts invoices={activeInvoices} currency={currency} />

        {/* Proactive get-paid-faster nudge for overdue invoices */}
        <OverdueNudge
          overdueCount={stats.overdueCount}
          overdueAmountLabel={formatCurrency(stats.overdueAmount, currency)}
          currencySymbol={currencySymbols[currency as Currency] || currencySymbols['USD']}
          onSendReminders={handleSendOverdueReminders}
          sending={bulkLoading}
        />

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
                    href="/invoice-generator-ai"
                    className="flex-1 md:flex-none justify-center px-3 py-2 md:px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 text-xs md:text-sm font-medium shadow-indigo-200 shadow-lg whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Generate with AI</span>
                    <span className="sm:hidden">AI</span>
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

        {/* Bulk action toolbar — only visible when items are selected */}
        {selectedIds.size > 0 && !showDeleted && activeTab === 'invoices' && (
          <div className="mb-4 flex items-center gap-3 flex-wrap bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-emerald-800">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-emerald-200" />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkAction('send')}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Send
              </button>
              <button
                onClick={() => handleBulkAction('send-reminders')}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Send Reminder
              </button>
              <button
                onClick={() => handleBulkAction('mark-paid')}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Mark Paid
              </button>
              <button
                onClick={() => handleBulkAction('export-csv')}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
            {bulkLoading && <span className="text-xs text-emerald-700 ml-1 animate-pulse">Processing...</span>}
            <button onClick={clearSelection} className="ml-auto text-xs text-gray-500 hover:text-gray-700">✕ Clear</button>
          </div>
        )}

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
                    {/* Select-all checkbox — only shown on invoices tab (not estimates/credit notes/deleted) */}
                    {!showDeleted && activeTab === 'invoices' && (
                      <th className="pl-4 pr-0 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={invoices.length > 0 && invoices.every(inv => selectedIds.has(inv.id!))}
                          onChange={() => toggleSelectAll(invoices.map(inv => inv.id!))}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Select all"
                        />
                      </th>
                    )}
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
                    <tr
                      key={invoice.id}
                      className={`hover:bg-gray-50/80 transition-colors group ${!showDeleted && activeTab === 'invoices' && selectedIds.has(invoice.id!) ? 'bg-emerald-50/60' : ''}`}
                    >
                      {/* Row checkbox */}
                      {!showDeleted && activeTab === 'invoices' && (
                        <td className="pl-4 pr-0 py-4 w-10" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(invoice.id!)}
                            onChange={() => toggleSelect(invoice.id!)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      )}
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
                        <div className="flex flex-col gap-1.5 items-start">
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
                          {invoice.viewedAt && (
                            <span
                              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                              title={`Opened ${new Date(invoice.viewedAt).toLocaleString()}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Seen
                            </span>
                          )}
                        </div>
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
                              {/* Estimates: inline "Convert to invoice" — reuses the
                                  existing convertFrom flow so approved quotes are never
                                  retyped. Only meaningful on the estimates tab. */}
                              {activeTab === 'estimates' && (
                                <button
                                  onClick={() => router.push(`/free-invoice-generator?convertFrom=${invoice.id}`)}
                                  className="p-1 md:p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Convert to invoice"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </button>
                              )}

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

