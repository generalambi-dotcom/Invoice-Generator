'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Plus, Download, Pencil, Trash2, X, TrendingDown } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
    { value: 'software',      label: 'Software & Tools',           color: 'bg-blue-100 text-blue-700' },
    { value: 'office',        label: 'Office & Supplies',          color: 'bg-amber-100 text-amber-700' },
    { value: 'travel',        label: 'Travel & Transport',         color: 'bg-sky-100 text-sky-700' },
    { value: 'utilities',     label: 'Utilities',                  color: 'bg-teal-100 text-teal-700' },
    { value: 'marketing',     label: 'Marketing & Advertising',    color: 'bg-purple-100 text-purple-700' },
    { value: 'payroll',       label: 'Payroll & Contractors',      color: 'bg-emerald-100 text-emerald-700' },
    { value: 'equipment',     label: 'Equipment',                  color: 'bg-orange-100 text-orange-700' },
    { value: 'food',          label: 'Food & Entertainment',       color: 'bg-pink-100 text-pink-700' },
    { value: 'professional',  label: 'Professional Services',      color: 'bg-indigo-100 text-indigo-700' },
    { value: 'other',         label: 'Other',                      color: 'bg-gray-100 text-gray-600' },
] as const;

type Category = typeof EXPENSE_CATEGORIES[number]['value'];

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD'];

const sym = (c: string) => ({ NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$' }[c] || c + ' ');
const fmt = (amount: number, currency: string) =>
    `${sym(currency)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const catInfo = (value: string) =>
    EXPENSE_CATEGORIES.find((c) => c.value === value) || { label: value, color: 'bg-gray-100 text-gray-600' };

// ── Types ─────────────────────────────────────────────────────────────────────

interface Expense {
    id: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    description: string;
    vendor: string | null;
    notes: string | null;
    receiptUrl: string | null;
    createdAt: string;
}

const emptyForm = () => ({
    amount: '',
    currency: 'NGN',
    category: 'other' as Category,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    vendor: '',
    notes: '',
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
    const router = useRouter();

    // Auth — the JWT is in an httpOnly cookie (not readable by JS). We gate on
    // the cached user profile and let the cookie authenticate API calls. `token`
    // is kept as a readiness sentinel so the existing `if (!token)` guards work.
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const authed = typeof window !== 'undefined' && !!localStorage.getItem('invoice-generator-current-user');
        if (!authed) { router.push('/signin'); return; }
        setToken('authenticated');
    }, [router]);

    // Data
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<{ totalAmount: number; byCategory: Record<string, number>; count: number }>({
        totalAmount: 0, byCategory: {}, count: 0,
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const now = new Date();
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterPeriod, setFilterPeriod] = useState<'this_month' | 'last_month' | 'this_year' | 'all'>('this_month');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const dateRange = useMemo(() => {
        if (filterPeriod === 'this_month') return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() };
        if (filterPeriod === 'last_month') { const lm = subMonths(now, 1); return { from: startOfMonth(lm).toISOString(), to: endOfMonth(lm).toISOString() }; }
        if (filterPeriod === 'this_year') return { from: startOfYear(now).toISOString(), to: endOfYear(now).toISOString() };
        return { from: '', to: '' };
    }, [filterPeriod]);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    });

    const loadExpenses = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory !== 'all') params.set('category', filterCategory);
            if (dateRange.from) params.set('from', dateRange.from);
            if (dateRange.to) params.set('to', dateRange.to);

            const res = await fetch(`/api/expenses?${params}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to load expenses');
            const data = await res.json();
            setExpenses(data.expenses || []);
            setSummary(data.summary || { totalAmount: 0, byCategory: {}, count: 0 });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadExpenses(); }, [token, filterCategory, filterPeriod]);

    // ── CRUD ─────────────────────────────────────────────────────────────────

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm());
        setShowModal(true);
    };

    const openEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setForm({
            amount: String(expense.amount),
            currency: expense.currency,
            category: expense.category as Category,
            date: format(new Date(expense.date), 'yyyy-MM-dd'),
            description: expense.description,
            vendor: expense.vendor || '',
            notes: expense.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.amount || !form.description || !form.date) {
            toast.error('Amount, description, and date are required');
            return;
        }
        setSaving(true);
        try {
            const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                    vendor: form.vendor || null,
                    notes: form.notes || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');
            toast.success(editingId ? 'Expense updated' : 'Expense added');
            setShowModal(false);
            loadExpenses();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this expense? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Expense deleted');
            loadExpenses();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Description', 'Vendor', 'Category', 'Amount', 'Currency'];
        const rows = expenses.map((e) => [
            format(new Date(e.date), 'dd/MM/yyyy'),
            `"${e.description}"`,
            `"${e.vendor || ''}"`,
            catInfo(e.category).label,
            e.amount.toFixed(2),
            e.currency,
        ].join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${filterPeriod}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV downloaded');
    };

    // ── Top categories ────────────────────────────────────────────────────────

    const topCategories = useMemo(() => {
        return Object.entries(summary.byCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4);
    }, [summary.byCategory]);

    const primaryCurrency = expenses[0]?.currency || 'NGN';

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {expenses.length > 0 && (
                                <button
                                    onClick={handleExportCSV}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </button>
                            )}
                            <button
                                onClick={openAdd}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Expense
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 col-span-2 lg:col-span-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalAmount, primaryCurrency)}</p>
                        <p className="text-xs text-gray-400 mt-1">{summary.count} expense{summary.count !== 1 ? 's' : ''}</p>
                    </div>
                    {topCategories.map(([cat, total]) => {
                        const info = catInfo(cat);
                        const pct = summary.totalAmount > 0 ? Math.round((total / summary.totalAmount) * 100) : 0;
                        return (
                            <div key={cat} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 truncate">{info.label}</p>
                                <p className="text-xl font-bold text-gray-900">{fmt(total, primaryCurrency)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-400">{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Period */}
                    <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {([
                            { v: 'this_month', l: 'This Month' },
                            { v: 'last_month', l: 'Last Month' },
                            { v: 'this_year',  l: 'This Year' },
                            { v: 'all',        l: 'All Time' },
                        ] as const).map(({ v, l }) => (
                            <button
                                key={v}
                                onClick={() => setFilterPeriod(v)}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filterPeriod === v ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    {/* Category filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="all">All categories</option>
                        {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                        <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-700 font-medium mb-1">No expenses yet</h3>
                        <p className="text-sm text-gray-400 mb-4">Track your business spending to see profit &amp; loss.</p>
                        <button
                            onClick={openAdd}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                            Add your first expense
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map((expense) => {
                                    const info = catInfo(expense.category);
                                    return (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {format(new Date(expense.date), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                                                {expense.notes && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{expense.notes}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.color}`}>
                                                    {info.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {expense.vendor || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                                                {fmt(expense.amount, expense.currency)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(expense)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Footer total */}
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">Total</td>
                                    <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">
                                        {fmt(summary.totalAmount, primaryCurrency)}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId ? 'Edit Expense' : 'Add Expense'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Amount + Currency */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="e.g. Monthly Figma subscription"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    {EXPENSE_CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Supplier</label>
                                <input
                                    type="text"
                                    value={form.vendor}
                                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                                    placeholder="e.g. Figma Inc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                    placeholder="Optional note…"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                            >
                                {saving ? 'Saving…' : editingId ? 'Update Expense' : 'Add Expense'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
