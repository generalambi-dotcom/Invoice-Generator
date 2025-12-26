'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getCreditNotesAPI, deleteCreditNoteAPI } from '@/lib/api-client';
import { currencySymbols } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';

export default function CreditNotesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'issued' | 'applied'>('all');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/signin?redirect=/credit-notes');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/signin?redirect=/credit-notes');
        return;
      }

      setUser(currentUser);
      loadCreditNotes();
    };

    checkAuth();
  }, [router]);

  const loadCreditNotes = async () => {
    try {
      setIsLoading(true);
      const result = await getCreditNotesAPI(filter === 'all' ? undefined : filter);
      setCreditNotes((result.creditNotes || result || []) as any[]);
    } catch (error) {
      console.error('Error loading credit notes:', error);
      setCreditNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCreditNotes();
    }
  }, [filter, user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this credit note? This action cannot be undone.')) return;

    try {
      await deleteCreditNoteAPI(id);
      loadCreditNotes();
    } catch (error: any) {
      alert(error.message || 'Failed to delete credit note');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      issued: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Issued' },
      applied: { bg: 'bg-green-100', text: 'text-green-800', label: 'Applied' },
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

  const filteredNotes = filter === 'all' 
    ? creditNotes 
    : creditNotes.filter(note => note.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
            <p className="text-gray-600 mt-1">Manage your credit notes and refunds</p>
          </div>
          <Link
            href="/credit-notes/create"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Credit Note
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'draft'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilter('issued')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'issued'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Issued
            </button>
            <button
              onClick={() => setFilter('applied')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'applied'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Applied
            </button>
          </div>
        </div>

        {/* Credit Notes List */}
        {filteredNotes.length === 0 ? (
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Credit Notes</h3>
            <p className="mt-2 text-gray-500">Create your first credit note to get started.</p>
            <Link
              href="/credit-notes/create"
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Credit Note
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Note #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {note.creditNoteNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(note.creditNoteDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(note.clientInfo as any)?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {note.invoice ? (
                            <Link
                              href={`/?invoiceId=${note.invoice.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {note.invoice.invoiceNumber}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {currencySymbols[note.currency as keyof typeof currencySymbols] || '$'}{' '}
                          {formatCurrency(note.total, note.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(note.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/credit-notes/${note.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View
                          </Link>
                          {note.status === 'draft' && (
                            <>
                              <Link
                                href={`/credit-notes/${note.id}/edit`}
                                className="text-green-600 hover:text-green-800 font-medium text-sm"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                              >
                                Delete
                              </button>
                            </>
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

