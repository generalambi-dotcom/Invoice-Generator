'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

interface Product {
  id: string;
  name: string;
  description: string | null;
  defaultRate: number;
  unit: string | null;
  taxable: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  defaultRate: '',
  unit: '',
  taxable: false,
};

export default function ProductsSettingsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { router.push('/signin'); return; }
    fetchProducts();
  }, [router]);

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  };

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load');
      setProducts(await res.json());
    } catch {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? '',
      defaultRate: String(p.defaultRate),
      unit: p.unit ?? '',
      taxable: p.taxable,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        defaultRate: parseFloat(form.defaultRate) || 0,
        unit: form.unit.trim() || null,
        taxable: form.taxable,
      };

      const res = editingId
        ? await fetch(`/api/products/${editingId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })
        : await fetch('/api/products', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      const saved: Product = await res.json();
      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? saved : p));
        toast.success('Product updated');
      } else {
        setProducts(prev => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Product added');
      }
      cancelForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product removed');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-900">
              ← Dashboard
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900">Product Catalogue</h1>
          </div>
          {!showForm && (
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Inline form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Website Design, Consulting, Delivery"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional – added to the line item description on the invoice"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm resize-none"
                  />
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Rate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.defaultRate}
                    onChange={e => setForm(f => ({ ...f, defaultRate: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="e.g. hour, piece, kg, day"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Taxable */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="taxable"
                    checked={form.taxable}
                    onChange={e => setForm(f => ({ ...f, taxable: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="taxable" className="text-sm text-gray-700">Taxable by default</label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" onClick={cancelForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products list */}
        {products.length === 0 && !showForm ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold mb-1">No products yet</p>
            <p className="text-sm text-gray-500 mb-6">Save your services and products so you can add them to invoices with one click.</p>
            <button
              onClick={openCreate}
              className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              + Add your first product
            </button>
          </div>
        ) : products.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product / Service</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Rate</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Unit</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          {p.description && (
                            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</div>
                          )}
                        </div>
                        {p.taxable && (
                          <span className="mt-0.5 flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">TAX</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                      {p.defaultRate > 0 ? p.defaultRate.toLocaleString() : <span className="text-gray-400 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      {p.unit ? (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{p.unit}</span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === p.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Products saved here appear in the "Add from Catalogue" picker when creating invoices.
        </p>
      </div>
    </div>
  );
}
