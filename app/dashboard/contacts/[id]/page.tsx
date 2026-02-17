'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Edit2, Mail, Phone, MapPin,
    Globe, Calendar, FileText, Plus, Loader2, Trash2,
    BarChart3, Send, Download, Filter
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    total: number;
    currency: string;
    paymentStatus: string;
}

interface StatementItem {
    id: string;
    invoiceNumber: string;
    invoiceDate: string | null;
    dueDate: string | null;
    total: number;
    paidAmount: number;
    balance: number;
    currency: string;
    paymentStatus: string;
}

interface StatementData {
    client: any;
    summary: {
        totalInvoiced: number;
        totalPaid: number;
        outstandingBalance: number;
        invoiceCount: number;
        overdueCount: number;
    };
    items: StatementItem[];
    generatedAt: string;
}

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    website: string | null;
    notes: string | null;
    invoices: Invoice[];
}

export default function ContactDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({});

    // Statement state
    const [showStatement, setShowStatement] = useState(false);
    const [statement, setStatement] = useState<StatementData | null>(null);
    const [loadingStatement, setLoadingStatement] = useState(false);
    const [sendingStatement, setSendingStatement] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchClient(params.id as string);
        }
    }, [params.id]);

    const fetchClient = async (id: string) => {
        try {
            const res = await fetch(`/api/clients/${id}`);
            const data = await res.json();
            if (res.ok) {
                setClient(data.client);
                setFormData(data.client);
            } else {
                toast.error('Client not found');
                router.push('/dashboard/contacts');
            }
        } catch (error) {
            console.error('Error fetching client', error);
            toast.error('Failed to load contact details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatement = async () => {
        setLoadingStatement(true);
        try {
            const queryParams = new URLSearchParams();
            if (dateFrom) queryParams.append('from', dateFrom);
            if (dateTo) queryParams.append('to', dateTo);
            const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

            const res = await fetch(`/api/clients/${params.id}/statement${qs}`);
            const data = await res.json();
            if (res.ok) {
                setStatement(data.statement);
            } else {
                toast.error('Failed to load statement');
            }
        } catch (error) {
            toast.error('Error loading statement');
        } finally {
            setLoadingStatement(false);
        }
    };

    const handleViewStatement = () => {
        if (!showStatement) {
            fetchStatement();
        }
        setShowStatement(!showStatement);
    };

    const handleEmailStatement = async () => {
        if (!client?.email) {
            toast.error('Client has no email address');
            return;
        }
        setSendingStatement(true);
        try {
            const res = await fetch(`/api/clients/${params.id}/statement`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success('Statement sent to ' + client.email);
            } else {
                toast.error(data.error || 'Failed to send statement');
            }
        } catch (error) {
            toast.error('Error sending statement');
        } finally {
            setSendingStatement(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/clients/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setClient(data.client);
                setIsEditing(false);
                toast.success('Contact updated');
            } else {
                toast.error(data.error || 'Update failed');
            }
        } catch (error) {
            toast.error('Error updating contact');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this contact? All associated history will be lost.')) return;

        try {
            const res = await fetch(`/api/clients/${params.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Contact deleted');
                router.push('/dashboard/contacts');
            } else {
                toast.error('Failed to delete contact');
            }
        } catch (error) {
            toast.error('Error deleting contact');
        }
    };

    const getCurrencySymbol = (currency: string) => {
        const symbols: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$', ZAR: 'R', KES: 'KSh', GHS: '₵', AED: 'د.إ', CNY: '¥', INR: '₹', BRL: 'R$', JPY: '¥' };
        return symbols[currency] || '$';
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!client) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Contacts
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sidebar: Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {client.name.charAt(0).toUpperCase()}
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                    <input
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                    <input
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                                    <textarea
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={3}
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-3 py-2 text-white bg-blue-600 rounded-lg text-sm font-medium"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h1 className="text-xl font-bold text-gray-900 break-words">{client.name}</h1>
                                <p className="text-sm text-gray-500 mb-6">Added on {new Date().toLocaleDateString()}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{client.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{client.phone || 'No phone'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <span>
                                            {[client.address, client.city, client.country].filter(Boolean).join(', ') || 'No address'}
                                        </span>
                                    </div>
                                    {client.website && (
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            <a href={client.website} target="_blank" className="text-blue-600 hover:underline truncate">
                                                {client.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push(`/?clientId=${client.id}`)}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create New Invoice
                            </button>
                            <button
                                onClick={handleViewStatement}
                                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 border transition-colors ${showStatement
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                {showStatement ? 'Hide Statement' : 'View Statement'}
                            </button>
                            <button
                                onClick={handleEmailStatement}
                                disabled={sendingStatement || !client.email}
                                className="w-full py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                {sendingStatement ? 'Sending...' : 'Email Statement'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2 border border-transparent hover:border-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Contact
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Statement Panel */}
                    {showStatement && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                                    Account Statement
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="text-xs px-2 py-1 border border-gray-200 rounded-md"
                                        placeholder="From"
                                    />
                                    <span className="text-gray-400 text-xs">to</span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="text-xs px-2 py-1 border border-gray-200 rounded-md"
                                        placeholder="To"
                                    />
                                    <button
                                        onClick={fetchStatement}
                                        className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {loadingStatement ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : statement ? (
                                <div className="p-6">
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                                            <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Invoiced</div>
                                            <div className="text-xl font-bold text-green-700 mt-1">
                                                {getCurrencySymbol(statement.items[0]?.currency || 'USD')}{statement.summary.totalInvoiced.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-green-500 mt-1">{statement.summary.invoiceCount} invoices</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Paid</div>
                                            <div className="text-xl font-bold text-blue-700 mt-1">
                                                {getCurrencySymbol(statement.items[0]?.currency || 'USD')}{statement.summary.totalPaid.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className={`rounded-xl p-4 text-center border ${statement.summary.outstandingBalance > 0
                                                ? 'bg-red-50 border-red-100'
                                                : 'bg-green-50 border-green-100'
                                            }`}>
                                            <div className={`text-xs font-semibold uppercase tracking-wider ${statement.summary.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>Outstanding</div>
                                            <div className={`text-xl font-bold mt-1 ${statement.summary.outstandingBalance > 0 ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                {getCurrencySymbol(statement.items[0]?.currency || 'USD')}{statement.summary.outstandingBalance.toFixed(2)}
                                            </div>
                                            {statement.summary.overdueCount > 0 && (
                                                <div className="text-xs text-red-500 mt-1">{statement.summary.overdueCount} overdue</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Statement Items Table */}
                                    {statement.items.length > 0 ? (
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Invoice</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                                                        <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                                                        <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Amount</th>
                                                        <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Paid</th>
                                                        <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {statement.items.map((item) => (
                                                        <tr key={item.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">{item.invoiceNumber}</td>
                                                            <td className="px-4 py-3 text-gray-500">
                                                                {item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${item.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                                        item.paymentStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                                                                            'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {item.paymentStatus || 'pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-900">
                                                                {getCurrencySymbol(item.currency)}{item.total.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-green-600">
                                                                {getCurrencySymbol(item.currency)}{item.paidAmount.toFixed(2)}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-semibold ${item.balance > 0 ? 'text-red-600' : 'text-green-600'
                                                                }`}>
                                                                {getCurrencySymbol(item.currency)}{item.balance.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-gray-50 border-t border-gray-200">
                                                        <td colSpan={3} className="px-4 py-3 font-bold text-gray-900">Total</td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                            {getCurrencySymbol(statement.items[0]?.currency || 'USD')}{statement.summary.totalInvoiced.toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-green-600">
                                                            {getCurrencySymbol(statement.items[0]?.currency || 'USD')}{statement.summary.totalPaid.toFixed(2)}
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold ${statement.summary.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                            {getCurrencySymbol(statement.items[0]?.currency || 'USD')}{statement.summary.outstandingBalance.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p>No invoices found for this date range</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-400 mt-4 text-center">
                                        Statement generated on {new Date(statement.generatedAt).toLocaleString()}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Invoice History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                Invoice History
                            </h2>
                            <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                {client.invoices?.length || 0} Records
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {(!client.invoices || client.invoices.length === 0) ? (
                                <div className="p-12 text-center text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No invoices created for this contact yet.</p>
                                </div>
                            ) : (
                                client.invoices.map(invoice => (
                                    <Link
                                        key={invoice.id}
                                        href={`/invoices/${invoice.id}`}
                                        className="block p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                        invoice.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {invoice.paymentStatus}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                                                </div>
                                                <span className="text-xs text-blue-600 hover:underline">View Invoice</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
