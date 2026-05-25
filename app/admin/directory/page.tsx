'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

const VERIFICATION_BADGE: Record<string, { label: string; className: string }> = {
  verified:   { label: '✓ Verified',  className: 'bg-green-100 text-green-800' },
  pending:    { label: '⏳ Pending',   className: 'bg-yellow-100 text-yellow-800' },
  rejected:   { label: '✗ Rejected',  className: 'bg-red-100 text-red-700' },
  unverified: { label: 'Unverified',  className: 'bg-gray-100 text-gray-600' },
};

export default function AdminDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 50 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` };
  };

  const loadData = useCallback(async (pageNum: number, searchTerm = search) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set('page', pageNum.toString());
      sp.set('limit', '50');
      if (searchTerm) sp.set('search', searchTerm);
      const res = await fetch(`/api/admin/directory?${sp.toString()}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setBusinesses(data.businesses);
      setPagination(data.pagination);
    } catch {
      showToast('Failed to load businesses', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push('/signin'); return; }
    if (!currentUser.isAdmin) { router.push('/'); return; }
    setUser(currentUser);
    loadData(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search);
  };

  const handleAction = async (
    bizId: string,
    action: 'verify' | 'reject' | 'pending' | 'feature' | 'unfeature' | 'flag' | 'unflag' | 'hide' | 'unhide',
    label: string
  ) => {
    if (!window.confirm(`${label} this business?`)) return;
    setActionLoading(bizId + action);
    try {
      const res = await fetch(`/api/admin/directory/${bizId}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Action failed');
      }
      const data = await res.json();
      // Update local state
      setBusinesses((prev) => prev.map((b) =>
        b.id === bizId
          ? {
              ...b,
              verificationStatus: data.business.verificationStatus ?? b.verificationStatus,
              directoryFeatured:  data.business.directoryFeatured  ?? b.directoryFeatured,
              directoryFlagged:   data.business.directoryFlagged   ?? b.directoryFlagged,
              directoryOptIn:     data.business.directoryOptIn     ?? b.directoryOptIn,
            }
          : b
      ));
      showToast(`${label} applied successfully`);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Business Directory Admin</h1>
            </div>
            <Link href="/admin/b2b" className="text-sm text-blue-600 hover:underline font-medium">
              B2B API Keys →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Opted-In Businesses ({pagination.total})</h2>
              <p className="text-sm text-gray-500">
                Verify ✓ = show badge · Feature ⭐ = priority ranking · Flag ⚠️ = internal note · Hide 🚫 = remove from public
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex max-w-sm w-full">
              <input
                type="text"
                placeholder="Search name, email, industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 font-medium">
                Search
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry / Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading directory...</td></tr>
                ) : businesses.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No matching businesses found.</td></tr>
                ) : (
                  businesses.map((biz) => {
                    const verif = VERIFICATION_BADGE[biz.verificationStatus ?? 'unverified'] ?? VERIFICATION_BADGE.unverified;
                    const isLoading = (action: string) => actionLoading === biz.id + action;
                    return (
                      <tr key={biz.id} className={`hover:bg-gray-50 transition-colors ${biz.directoryFlagged ? 'bg-red-50' : biz.directoryFeatured ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 truncate max-w-[180px]" title={biz.name}>{biz.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">{biz.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div>{biz.industry || '-'}</div>
                          <div className="text-xs text-gray-400">{biz.companySize || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${verif.className}`}>
                            {verif.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {biz.directoryFeatured && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">⭐ Featured</span>
                            )}
                            {biz.directoryFlagged && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Flagged</span>
                            )}
                            {!biz.directoryOptIn && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">🚫 Hidden</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {/* Verify / Reject */}
                            {biz.verificationStatus !== 'verified' ? (
                              <button
                                onClick={() => handleAction(biz.id, 'verify', 'Verify')}
                                disabled={!!actionLoading}
                                className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('verify') ? '…' : '✓ Verify'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(biz.id, 'reject', 'Revoke verification for')}
                                disabled={!!actionLoading}
                                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('reject') ? '…' : 'Revoke'}
                              </button>
                            )}

                            {/* Feature / Unfeature */}
                            {!biz.directoryFeatured ? (
                              <button
                                onClick={() => handleAction(biz.id, 'feature', 'Feature')}
                                disabled={!!actionLoading}
                                className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('feature') ? '…' : '⭐ Feature'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(biz.id, 'unfeature', 'Un-feature')}
                                disabled={!!actionLoading}
                                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('unfeature') ? '…' : '★ Un-feature'}
                              </button>
                            )}

                            {/* Flag / Unflag */}
                            {!biz.directoryFlagged ? (
                              <button
                                onClick={() => handleAction(biz.id, 'flag', 'Flag')}
                                disabled={!!actionLoading}
                                className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('flag') ? '…' : '⚠️ Flag'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(biz.id, 'unflag', 'Clear flag on')}
                                disabled={!!actionLoading}
                                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('unflag') ? '…' : 'Clear Flag'}
                              </button>
                            )}

                            {/* Hide / Unhide */}
                            {biz.directoryOptIn ? (
                              <button
                                onClick={() => handleAction(biz.id, 'hide', 'Hide from directory')}
                                disabled={!!actionLoading}
                                className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('hide') ? '…' : '🚫 Hide'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(biz.id, 'unhide', 'Restore to directory')}
                                disabled={!!actionLoading}
                                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                              >
                                {isLoading('unhide') ? '…' : '↩ Restore'}
                              </button>
                            )}

                            {/* View profile */}
                            <Link
                              href={`/businesses/${biz.id}`}
                              target="_blank"
                              className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded font-medium"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
              <div className="flex gap-2">
                <button onClick={() => { setPage(page - 1); loadData(page - 1); }} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => { setPage(page + 1); loadData(page + 1); }} disabled={page === pagination.pages} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
