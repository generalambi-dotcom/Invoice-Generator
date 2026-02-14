'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Filter, AlertCircle, Info, CheckCircle, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/token-refresh';

export default function AdminLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchLogs, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, filterCategory, filterLevel]);

    const checkAuth = async () => {
        const user = getCurrentUser();
        if (!user || !user.isAdmin) {
            router.push('/');
            return;
        }
        fetchLogs();
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = await getValidAccessToken();

            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (filterLevel) params.append('level', filterLevel);

            const response = await fetch(`/api/admin/logs?${params.toString()}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            });

            if (!response.ok) throw new Error('Failed to fetch logs');

            const data = await response.json();
            setLogs(data.logs || []);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            case 'warn': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <AlertCircle className="w-4 h-4" />;
            case 'warn': return <AlertCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
                    <p className="text-sm text-gray-500">Monitor system events and webhook activity</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${autoRefresh
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-white text-gray-600 border hover:bg-gray-50'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">All Categories</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="system">System</option>
                    <option value="auth">Auth</option>
                    <option value="payment">Payment</option>
                </select>

                <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                </select>

                {(filterCategory || filterLevel) && (
                    <button
                        onClick={() => { setFilterCategory(''); setFilterLevel(''); }}
                        className="text-sm text-red-600 hover:text-red-700"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Timestamp</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Level</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Category</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Message</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No logs found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                                                {getLevelIcon(log.level)}
                                                {log.level.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium uppercase tracking-wide">
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {log.message}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.metadata && (
                                                <details className="cursor-pointer group">
                                                    <summary className="text-xs text-blue-600 hover:text-blue-700 font-medium select-none">
                                                        View Data
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-gray-900 text-gray-50 rounded-lg text-xs overflow-x-auto max-w-sm">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
