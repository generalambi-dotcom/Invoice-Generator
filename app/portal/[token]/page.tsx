'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Download, ExternalLink, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';

interface PortalInvoice {
    id: string;
    type: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    total: number;
    paidAmount: number;
    currency: string;
    paymentStatus: string;
    notes: string | null;
    paymentLink: string | null;
    sentAt: string | null;
}

interface PortalData {
    clientEmail: string;
    clientName: string | null;
    senderCompanyName: string;
    senderName: string;
    expiresAt: string;
    invoiceCount: number;
    totalOutstanding: number;
    totalPaid: number;
    currency: string;
}

const currencySymbol = (code: string) => {
    const map: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$' };
    return map[code] || code + ' ';
};

const formatMoney = (amount: number, currency: string) =>
    `${currencySymbol(currency)}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
        paid: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Paid', cls: 'bg-emerald-100 text-emerald-700' },
        overdue: { icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Overdue', cls: 'bg-red-100 text-red-700' },
        pending: { icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
        cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
    };
    const config = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.cls}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default function ClientPortalPage() {
    const params = useParams();
    const token = params.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [portal, setPortal] = useState<PortalData | null>(null);
    const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

    useEffect(() => {
        const fetchPortal = async () => {
            try {
                const res = await fetch(`/api/portal/${token}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to load portal');
                setPortal(data.portal);
                setInvoices(data.invoices);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPortal();
    }, [token]);

    const handleDownloadPDF = async (invoice: PortalInvoice) => {
        setDownloadingId(invoice.id);
        try {
            // Fetch the full invoice for PDF generation
            const res = await fetch(`/api/invoices/${invoice.id}`);
            if (!res.ok) throw new Error('Could not load invoice data');
            const { invoice: fullInvoice } = await res.json();
            const blob = await pdf(<InvoicePDF invoice={fullInvoice} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            alert('Could not generate PDF: ' + err.message);
        } finally {
            setDownloadingId(null);
        }
    };

    const filtered = invoices.filter((inv) => {
        if (activeFilter === 'all') return true;
        return inv.paymentStatus === activeFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading your invoices…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Portal Unavailable</h2>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!portal) return null;

    const outstanding = portal.totalOutstanding;
    const sym = currencySymbol(portal.currency);

    const countByStatus = {
        pending: invoices.filter((i) => i.paymentStatus === 'pending').length,
        paid: invoices.filter((i) => i.paymentStatus === 'paid').length,
        overdue: invoices.filter((i) => i.paymentStatus === 'overdue').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Invoice portal from</p>
                            <p className="text-sm font-semibold text-gray-900">{portal.senderCompanyName}</p>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400">
                            Link expires {format(new Date(portal.expiresAt), 'dd MMM yyyy')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Welcome banner */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                        {portal.clientName ? `Hi, ${portal.clientName}` : 'Your Invoice Portal'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        All invoices from <span className="font-medium text-gray-700">{portal.senderCompanyName}</span> addressed to{' '}
                        <span className="font-medium text-gray-700">{portal.clientEmail}</span>.
                    </p>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mt-5">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{portal.invoiceCount}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Total invoices</p>
                        </div>
                        <div className={`rounded-xl p-4 text-center ${outstanding > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                            <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {sym}{Math.abs(outstanding).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className={`text-xs mt-0.5 ${outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {outstanding > 0 ? 'Outstanding' : 'All paid'}
                            </p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-700">
                                {sym}{portal.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-emerald-600 mt-0.5">Total paid</p>
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'pending', 'overdue', 'paid'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                activeFilter === f
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {f === 'all' ? `All (${invoices.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${countByStatus[f] || 0})`}
                        </button>
                    ))}
                </div>

                {/* Invoice list */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No {activeFilter !== 'all' ? activeFilter : ''} invoices found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((invoice) => {
                            const balance = invoice.total - invoice.paidAmount;
                            const isOverdue = invoice.paymentStatus === 'overdue';
                            const isPaid = invoice.paymentStatus === 'paid';

                            return (
                                <div
                                    key={invoice.id}
                                    className={`bg-white rounded-2xl border shadow-sm p-5 ${
                                        isOverdue ? 'border-red-200' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-semibold text-gray-900">
                                                    {invoice.type === 'estimate' ? 'Estimate' : invoice.type === 'credit_note' ? 'Credit Note' : 'Invoice'}{' '}
                                                    {invoice.invoiceNumber}
                                                </span>
                                                <StatusBadge status={invoice.paymentStatus} />
                                            </div>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                                <span>Dated {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</span>
                                                <span>Due {format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-gray-900 text-lg">
                                                {formatMoney(invoice.total, invoice.currency)}
                                            </p>
                                            {!isPaid && invoice.paidAmount > 0 && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatMoney(balance, invoice.currency)} remaining
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions row */}
                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                        <a
                                            href={`/invoice/${invoice.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            View
                                        </a>
                                        <button
                                            onClick={() => handleDownloadPDF(invoice)}
                                            disabled={downloadingId === invoice.id}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors disabled:opacity-60"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            {downloadingId === invoice.id ? 'Generating…' : 'Download PDF'}
                                        </button>
                                        {invoice.paymentLink && !isPaid && (
                                            <a
                                                href={invoice.paymentLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                            >
                                                Pay Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pb-6">
                    <p>
                        Powered by{' '}
                        <a href="https://invoicegenerator.ng" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            InvoiceGenerator.ng
                        </a>
                        {' '}· This link expires {format(new Date(portal.expiresAt), 'dd MMM yyyy')}
                    </p>
                </div>
            </div>
        </div>
    );
}
