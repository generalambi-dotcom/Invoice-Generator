'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import { loadInvoicesAPI, deleteInvoiceAPI, updateOverdueInvoicesAPI, getPaymentRemindersAPI, sendPaymentRemindersAPI, approveInvoiceAPI, rejectInvoiceAPI, requestApprovalAPI, markInvoiceSentAPI } from '@/lib/api-client';
import { Invoice, currencySymbols } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';

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

  useEffect(() => {
    const checkAuth = async () => {
      // Check for token first
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/signin?redirect=/dashboard');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        // Try to get user from token if localStorage user is missing
        // This handles cases where localStorage was cleared but token exists
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('invoice-generator-current-user', JSON.stringify(userData.user));
            setUser(userData.user);
            loadInvoiceData();
            loadPaymentReminders();
            return;
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
        router.push('/signin?redirect=/dashboard');
        return;
      }

      setUser(currentUser);
      loadInvoiceData();
      loadPaymentReminders();

      // Update overdue invoices on mount
      const updateOverdue = async () => {
        try {
          await updateOverdueInvoicesAPI();
          loadInvoiceData();
        } catch (error) {
          console.error('Error updating overdue invoices:', error);
        }
      };
      updateOverdue();
    };

    checkAuth();
  }, [router]);

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
    const invoices = activeInvoices;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Invoices</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInvoices}</p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {currencySymbols[activeInvoices[0]?.currency || 'USD']} {formatCurrency(stats.totalAmount, activeInvoices[0]?.currency || 'USD')}
            </p>
            <p className="text-sm text-gray-500 mt-1">All invoices</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Paid</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {currencySymbols[activeInvoices[0]?.currency || 'USD']} {formatCurrency(stats.paidAmount, activeInvoices[0]?.currency || 'USD')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{stats.paidCount} invoices</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Unpaid</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {currencySymbols[activeInvoices[0]?.currency || 'USD']} {formatCurrency(stats.unpaidAmount, activeInvoices[0]?.currency || 'USD')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{stats.unpaidCount} invoices</p>
            {stats.overdueCount > 0 && (
              <p className="text-xs text-red-600 mt-1">({stats.overdueCount} overdue)</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            {!showDeleted && (
              <>
                <Link
                  href="/"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Invoice
                </Link>
                <Link
                  href="/reports"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reports
                </Link>
              </>
            )}
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showDeleted ? 'View Active Invoices' : 'View Deleted Invoices'}
            </button>
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {showDeleted ? 'No Deleted Invoices' : 'No Invoices Found'}
            </h3>
            <p className="mt-2 text-gray-500">
              {showDeleted
                ? 'You haven\'t deleted any invoices yet.'
                : 'Create your first invoice to get started.'}
            </p>
            {!showDeleted && (
              <Link
                href="/"
                className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Status
                    </th>
                    {showDeleted && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deleted
                      </th>
                    )}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.client.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {currencySymbols[invoice.currency]} {formatCurrency(invoice.total, invoice.currency)}
                        </div>
                        {invoice.paidAmount && invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid: {currencySymbols[invoice.currency]} {formatCurrency(invoice.paidAmount, invoice.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.paymentStatus === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : invoice.paymentStatus === 'cancelled'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {invoice.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getApprovalStatusBadge((invoice as any).approvalStatus || 'draft')}
                      </td>
                      {showDeleted && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {(invoice as any).deletedAt
                              ? format(new Date((invoice as any).deletedAt), 'MMM dd, yyyy')
                              : 'N/A'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(invoice)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              View
                            </button>
                          </div>
                          {!showDeleted && (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {(invoice as any).approvalStatus === 'draft' && (
                                <button
                                  onClick={() => handleRequestApproval(invoice.id!)}
                                  disabled={processingApproval === invoice.id}
                                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-50"
                                  title="Request Approval"
                                >
                                  {processingApproval === invoice.id ? '...' : 'Request Approval'}
                                </button>
                              )}
                              {(invoice as any).approvalStatus === 'pending_approval' && user?.isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleApproveInvoice(invoice.id!)}
                                    disabled={processingApproval === invoice.id}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                                    title="Approve"
                                  >
                                    {processingApproval === invoice.id ? '...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleRejectInvoice(invoice.id!)}
                                    disabled={processingApproval === invoice.id}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                                    title="Reject"
                                  >
                                    {processingApproval === invoice.id ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {(invoice as any).approvalStatus === 'approved' && (
                                <button
                                  onClick={() => handleMarkAsSent(invoice.id!)}
                                  disabled={processingApproval === invoice.id}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                                  title="Mark as Sent"
                                >
                                  {processingApproval === invoice.id ? '...' : 'Mark as Sent'}
                                </button>
                              )}
                              {!showDeleted && (invoice.paymentStatus === 'pending' || invoice.paymentStatus === 'overdue') && (
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
                                  className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                                >
                                  Record Payment
                                </button>
                              )}
                              {showDeleted ? (
                                <>
                                  <button
                                    onClick={() => handleRestore(invoice.id!)}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDelete(invoice.id!)}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    aria-label="Permanently delete"
                                  >
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (confirm('Delete this invoice? It will be moved to deleted invoices.')) {
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
                                        console.error('Error deleting invoice:', error);
                                        alert('Failed to delete invoice. Please try again.');
                                      }
                                    }
                                  }}
                                  className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                  aria-label="Delete invoice"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
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

