'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

const TIER_COLORS: Record<string, string> = {
  free:       'bg-gray-100 text-gray-700',
  starter:    'bg-blue-100 text-blue-700',
  growth:     'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-800',
};

const TIER_LIMITS: Record<string, number> = {
  free: 100, starter: 1000, growth: 5000, enterprise: 100000,
};

export default function AdminB2BPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null); // shown once after creation

  const [form, setForm] = useState({
    companyName: '',
    email: '',
    tier: 'free',
    notes: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` };
  };

  const loadKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/b2b/keys', { headers: getAuthHeader() });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      showToast('Failed to load API keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push('/signin'); return; }
    if (!currentUser.isAdmin) { router.push('/'); return; }
    setUser(currentUser);
    loadKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create');
    try {
      const res = await fetch('/api/admin/b2b/keys', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create key');
      }
      const data = await res.json();
      setNewKeyValue(data.key);
      setForm({ companyName: '', email: '', tier: 'free', notes: '' });
      setShowForm(false);
      loadKeys();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (keyId: string, isActive: boolean) => {
    setActionLoading(keyId);
    try {
      const res = await fetch(`/api/admin/b2b/keys/${keyId}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      setKeys((prev) => prev.map((k) => k.id === keyId ? { ...k, isActive: !isActive } : k));
      showToast(isActive ? 'Key deactivated' : 'Key activated');
    } catch {
      showToast('Failed to update key', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (keyId: string, prefix: string) => {
    if (!window.confirm(`Permanently delete key ${prefix}…? This cannot be undone.`)) return;
    setActionLoading(keyId + 'del');
    try {
      const res = await fetch(`/api/admin/b2b/keys/${keyId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed');
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      showToast('Key deleted');
    } catch {
      showToast('Failed to delete key', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Show new key once */}
      {newKeyValue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">API Key Created ✓</h3>
            <p className="text-sm text-red-600 font-medium mb-4">⚠️ Copy this key now — it will never be shown again.</p>
            <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg break-all mb-6 select-all">
              {newKeyValue}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKeyValue).catch(() => {});
                showToast('Key copied to clipboard');
                setNewKeyValue(null);
              }}
              className="w-full py-2.5 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-600"
            >
              Copy & Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/directory" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">B2B API Keys</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600"
            >
              + New Key
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 w-full">
        {/* Tier reference */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(TIER_LIMITS).map(([tier, limit]) => (
            <div key={tier} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize mb-2 ${TIER_COLORS[tier]}`}>{tier}</span>
              <div className="text-lg font-bold text-gray-900">{limit.toLocaleString()}</div>
              <div className="text-xs text-gray-400">calls/day</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Issue New API Key</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                  {Object.keys(TIER_LIMITS).map((t) => <option key={t} value={t} className="capitalize">{t} ({TIER_LIMITS[t].toLocaleString()}/day)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (internal)</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Invoice #INV-2026-042"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={actionLoading === 'create'} className="px-6 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50">
                {actionLoading === 'create' ? 'Creating…' : 'Generate Key'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Keys table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Active API Keys ({keys.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No API keys yet. Issue one above.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keys.map((k) => (
                  <tr key={k.id} className={`hover:bg-gray-50 ${!k.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{k.companyName}</div>
                      <div className="text-xs text-gray-400">{k.email}</div>
                      {k.notes && <div className="text-xs text-gray-400 italic mt-0.5">{k.notes}</div>}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{k.keyPrefix}…</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize ${TIER_COLORS[k.tier] ?? TIER_COLORS.free}`}>{k.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{k.callsToday} / {k.dailyLimit} today</div>
                      {k.lastUsedAt && <div className="text-xs text-gray-400">Last: {new Date(k.lastUsedAt).toLocaleDateString()}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {k.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleToggle(k.id, k.isActive)}
                          disabled={!!actionLoading}
                          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {actionLoading === k.id ? '…' : k.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(k.id, k.keyPrefix)}
                          disabled={!!actionLoading}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          {actionLoading === k.id + 'del' ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Docs box */}
        <div className="mt-6 bg-gray-900 text-gray-300 rounded-xl p-6 text-sm font-mono">
          <div className="text-green-400 font-bold mb-3 font-sans"># B2B API Usage Examples</div>
          <div className="space-y-2 text-xs leading-relaxed">
            <div><span className="text-yellow-300">GET</span> /api/b2b/businesses?key=b2b_xxxx&industry=Consulting&state=Lagos&verified=true</div>
            <div><span className="text-yellow-300">GET</span> /api/b2b/businesses?key=b2b_xxxx&active=true&limit=500&page=2</div>
            <div><span className="text-yellow-300">GET</span> /api/b2b/leads?key=b2b_xxxx&industry=Plumbing&status=open&since=2026-01-01</div>
          </div>
          <div className="mt-4 text-gray-500 text-xs font-sans">
            Starter+ gets CAC/TIN numbers and email. Growth+ gets customer PII on leads.
          </div>
        </div>
      </div>
    </div>
  );
}
