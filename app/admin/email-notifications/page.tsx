'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

interface EmailTemplate {
    id: string;
    key: string;
    name: string;
    description: string | null;
    category: string;
    subject: string;
    body: string;
    enabled: boolean;
    variables: string | null;
    updatedAt: string;
}

interface EmailLog {
    id: string;
    to: string;
    subject: string;
    status: string;
    errorMessage: string | null;
    sentAt: string;
}

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
    auth: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Auth' },
    invoice: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Invoice' },
    payment: { bg: 'bg-green-100', text: 'text-green-700', label: 'Payment' },
    system: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'System' },
};

const statusColors: Record<string, string> = {
    sent: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    bounced: 'bg-yellow-100 text-yellow-700',
};

export default function EmailNotificationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');

    // Templates state
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Logs state
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotalPages, setLogsTotalPages] = useState(1);
    const [logsTotal, setLogsTotal] = useState(0);
    const [logsStatusFilter, setLogsStatusFilter] = useState('');
    const [logsSearch, setLogsSearch] = useState('');
    const [loadingLogs, setLoadingLogs] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    };

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/signin');
            return;
        }
        if (!currentUser.isAdmin) {
            router.push('/');
            return;
        }
        initData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initData = async () => {
        setLoading(true);
        // Seed first, then load
        try {
            await fetch('/api/admin/email-notifications/seed', {
                method: 'POST',
                headers: getAuthHeaders(),
            });
        } catch (e) {
            console.error('Seed error:', e);
        }
        await loadTemplates();
        setLoading(false);
    };

    const loadTemplates = async () => {
        try {
            const res = await fetch('/api/admin/email-notifications', {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates);
            }
        } catch (e) {
            console.error('Error loading templates:', e);
        }
    };

    const loadLogs = async (page = 1) => {
        setLoadingLogs(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '15' });
            if (logsStatusFilter) params.set('status', logsStatusFilter);
            if (logsSearch) params.set('search', logsSearch);

            const res = await fetch(`/api/admin/email-notifications/logs?${params}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setLogsPage(data.pagination.page);
                setLogsTotalPages(data.pagination.totalPages);
                setLogsTotal(data.pagination.total);
            }
        } catch (e) {
            console.error('Error loading logs:', e);
        }
        setLoadingLogs(false);
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            loadLogs(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, logsStatusFilter]);

    const handleToggle = async (template: EmailTemplate) => {
        setTogglingId(template.id);
        try {
            const res = await fetch('/api/admin/email-notifications', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ id: template.id, enabled: !template.enabled }),
            });
            if (res.ok) {
                setTemplates((prev) =>
                    prev.map((t) => (t.id === template.id ? { ...t, enabled: !t.enabled } : t))
                );
            }
        } catch (e) {
            console.error('Toggle error:', e);
        }
        setTogglingId(null);
    };

    const openEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setEditSubject(template.subject);
        setEditBody(template.body);
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/email-notifications', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    id: editingTemplate.id,
                    subject: editSubject,
                    body: editBody,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates((prev) =>
                    prev.map((t) => (t.id === editingTemplate.id ? data.template : t))
                );
                setEditingTemplate(null);
            }
        } catch (e) {
            console.error('Save error:', e);
        }
        setSaving(false);
    };

    // Group templates by category
    const grouped = templates.reduce<Record<string, EmailTemplate[]>>((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
    }, {});

    const categoryOrder = ['auth', 'invoice', 'payment', 'system'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading email notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📧</span>
                            <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
                        </div>
                        <Link
                            href="/admin"
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            ← Back to Admin
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'templates'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📋 Notification Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'logs'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📊 Email Logs {logsTotal > 0 && <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">{logsTotal}</span>}
                    </button>
                </div>

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
                                <div className="text-sm text-gray-500">Total Templates</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-green-600">{templates.filter((t) => t.enabled).length}</div>
                                <div className="text-sm text-gray-500">Enabled</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-red-500">{templates.filter((t) => !t.enabled).length}</div>
                                <div className="text-sm text-gray-500">Disabled</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-indigo-600">{Object.keys(grouped).length}</div>
                                <div className="text-sm text-gray-500">Categories</div>
                            </div>
                        </div>

                        {/* Templates by category */}
                        {categoryOrder.map((cat) => {
                            const items = grouped[cat];
                            if (!items || items.length === 0) return null;
                            const catInfo = categoryColors[cat] || { bg: 'bg-gray-100', text: 'text-gray-700', label: cat };
                            return (
                                <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${catInfo.bg} ${catInfo.text}`}>
                                                {catInfo.label}
                                            </span>
                                            {cat === 'auth' && '🔐 Authentication'}
                                            {cat === 'invoice' && '📄 Invoices'}
                                            {cat === 'payment' && '💳 Payments'}
                                            {cat === 'system' && '⚙️ System'}
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {items.map((template) => (
                                            <div
                                                key={template.id}
                                                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${!template.enabled ? 'opacity-60' : ''
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold text-gray-900">{template.name}</h4>
                                                        <code className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                                            {template.key}
                                                        </code>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1">{template.description}</p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        Subject: <span className="text-gray-600">{template.subject}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button
                                                        onClick={() => openEdit(template)}
                                                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(template)}
                                                        disabled={togglingId === template.id}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${template.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                                                            } ${togglingId === template.id ? 'opacity-50' : ''}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${template.enabled ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Search by recipient or subject..."
                                        value={logsSearch}
                                        onChange={(e) => setLogsSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && loadLogs(1)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <select
                                    value={logsStatusFilter}
                                    onChange={(e) => setLogsStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="sent">Sent</option>
                                    <option value="failed">Failed</option>
                                    <option value="bounced">Bounced</option>
                                </select>
                                <button
                                    onClick={() => loadLogs(1)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {loadingLogs ? (
                                <div className="p-12 text-center">
                                    <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">Loading logs...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-500">No email logs found.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Recipient</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Subject</th>
                                                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{log.to}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.subject}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[log.status] || 'bg-gray-100 text-gray-600'}`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {new Date(log.sentAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination */}
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Showing {(logsPage - 1) * 15 + 1}–{Math.min(logsPage * 15, logsTotal)} of {logsTotal}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => loadLogs(logsPage - 1)}
                                                disabled={logsPage <= 1}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ← Previous
                                            </button>
                                            <button
                                                onClick={() => loadLogs(logsPage + 1)}
                                                disabled={logsPage >= logsTotalPages}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Template Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Edit: {editingTemplate.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{editingTemplate.description}</p>
                            </div>
                            <button
                                onClick={() => setEditingTemplate(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Available Variables */}
                            {editingTemplate.variables && (
                                <div className="bg-indigo-50 rounded-lg p-3">
                                    <p className="text-xs font-medium text-indigo-700 mb-2">Available Variables:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {JSON.parse(editingTemplate.variables).map((v: string) => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => {
                                                    setEditBody((prev) => prev + v);
                                                }}
                                                className="px-2 py-1 text-xs font-mono bg-white border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-100 transition-colors cursor-pointer"
                                                title="Click to insert into body"
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Line</label>
                                <input
                                    type="text"
                                    value={editSubject}
                                    onChange={(e) => setEditSubject(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Body (HTML)</label>
                                <textarea
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    rows={12}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preview</label>
                                <div
                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: editBody }}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingTemplate(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
