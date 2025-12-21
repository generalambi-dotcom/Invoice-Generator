'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import {
  loadInvoices,
  loadDeletedInvoices,
  restoreInvoice,
  permanentlyDeleteInvoice,
  deleteInvoice,
} from '@/lib/storage';
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

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    setUser(currentUser);
    loadInvoiceData();
  }, [router]);

  const loadInvoiceData = () => {
    const active = loadInvoices();
    const deleted = loadDeletedInvoices();
    setActiveInvoices(active.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.invoiceDate).getTime();
      const dateB = new Date(b.createdAt || b.invoiceDate).getTime();
      return dateB - dateA;
    }));
    setDeletedInvoices(deleted.sort((a, b) => {
      const dateA = new Date((a as any).deletedAt || a.createdAt || a.invoiceDate).getTime();
      const dateB = new Date((b as any).deletedAt || b.createdAt || b.invoiceDate).getTime();
      return dateB - dateA;
    }));
    setIsLoading(false);
  };

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  const handleRestore = (id: string) => {
    if (confirm('Restore this invoice?')) {
      restoreInvoice(id);
      loadInvoiceData();
    }
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm('Permanently delete this invoice? This action cannot be undone.')) {
      permanentlyDeleteInvoice(id);
      loadInvoiceData();
    }
  };

  const handleView = (invoice: Invoice) => {
    sessionStorage.setItem('loadInvoice', JSON.stringify(invoice));
    router.push('/');
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
        {/* Action Buttons */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            {!showDeleted && (
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View
                          </button>
                          {showDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestore(invoice.id)}
                                className="text-green-600 hover:text-green-800 font-medium text-sm"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(invoice.id)}
                                className="text-red-600 hover:text-red-800"
                                aria-label="Permanently delete"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm('Delete this invoice?')) {
                                  deleteInvoice(invoice.id);
                                  loadInvoiceData();
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete invoice"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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

