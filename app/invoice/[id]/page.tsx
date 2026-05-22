'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '@/types/invoice';
import InvoicePaper from '@/components/InvoicePaper';
import { ArrowLeft, Download, Printer, Share2, Mail } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import { SendEmailModal } from '@/components/SendEmailModal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function InvoiceViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [generatingPortal, setGeneratingPortal] = useState(false);

    // Payment history
    const [payments, setPayments] = useState<any[]>([]);
    const [refundingId, setRefundingId] = useState<string | null>(null);

    // Activity / audit trail
    const [events, setEvents] = useState<any[]>([]);
    const [showActivity, setShowActivity] = useState(false);

    const authHeader = () => ({
        Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`,
    });

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await fetch(`/api/invoices/${id}`);
                if (!response.ok) throw new Error('Failed to load invoice');
                const data = await response.json();
                setInvoice(data.invoice);

                // Load payment history (auth required)
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
                if (token) {
                    const [pRes, eRes] = await Promise.all([
                        fetch(`/api/invoices/${id}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(`/api/invoices/${id}/events`, { headers: { Authorization: `Bearer ${token}` } }),
                    ]);
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        setPayments(pData.payments || []);
                    }
                    if (eRes.ok) {
                        const eData = await eRes.json();
                        setEvents(eData.events || []);
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInvoice();
    }, [id]);

    const handleRefund = async (paymentId: string) => {
        if (!confirm('Mark this payment as refunded? This will reduce the invoice paid amount.')) return;
        setRefundingId(paymentId);
        try {
            const res = await fetch(`/api/payments/${paymentId}/refund`, {
                method: 'POST',
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Refund failed');
            toast.success('Payment refunded successfully');
            // Refresh invoice + payments
            const invRes = await fetch(`/api/invoices/${id}`);
            if (invRes.ok) setInvoice((await invRes.json()).invoice);
            setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p));
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setRefundingId(null);
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoice) return;

        try {
            const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error generating PDF');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSharePortal = async () => {
        const clientEmail = invoice?.client?.email || (invoice as any)?.clientInfo?.email;
        if (!clientEmail) {
            toast.error('No client email on this invoice to generate a portal link');
            return;
        }
        setGeneratingPortal(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
            const res = await fetch('/api/portal/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientEmail,
                    clientName: invoice?.client?.name || (invoice as any)?.clientInfo?.name,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate link');
            await navigator.clipboard.writeText(data.portalUrl);
            toast.success('Client portal link copied to clipboard!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate portal link');
        } finally {
            setGeneratingPortal(false);
        }
    };

    const handleWhatsAppShare = () => {
        if (!invoice) return;
        const url = `${window.location.origin}/invoice/${invoice.id}`;
        const companyName = invoice.company?.name || 'us';
        const text = `Here is your invoice ${invoice.invoiceNumber} from ${companyName}: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-4 text-lg font-semibold">{error || 'Invoice not found'}</div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50/50 py-8 print:bg-white print:py-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Invoice {invoice.invoiceNumber}
                                </h1>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <p className="text-sm text-gray-500">
                                        Created {new Date(invoice.createdAt || invoice.invoiceDate).toLocaleDateString()}
                                    </p>
                                    {invoice.sentAt && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Sent {format(new Date(invoice.sentAt), 'dd MMM yyyy')}
                                        </span>
                                    )}
                                    {invoice.viewedAt ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            Seen {format(new Date(invoice.viewedAt), 'dd MMM yyyy, h:mm a')}
                                        </span>
                                    ) : invoice.sentAt ? (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            Not yet opened
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => router.push(`/free-invoice-generator?invoiceId=${invoice.id}`)}
                                className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm"
                            >
                                Edit {invoice.type === 'estimate' ? 'Estimate' : invoice.type === 'credit_note' ? 'Credit Note' : 'Invoice'}
                            </button>
                            {invoice.type === 'estimate' && (
                                <button
                                    onClick={() => router.push(`/free-invoice-generator?convertFrom=${invoice.id}`)}
                                    className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
                                >
                                    Convert to Invoice
                                </button>
                            )}
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button
                                onClick={handleWhatsAppShare}
                                className="inline-flex items-center px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors shadow-sm text-sm font-medium"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                WhatsApp
                            </button>
                            <button
                                onClick={handleSharePortal}
                                disabled={generatingPortal}
                                title="Copy client portal link to clipboard"
                                className="inline-flex items-center px-4 py-2 bg-white border border-emerald-200 rounded-lg shadow-sm text-sm font-medium text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                {generatingPortal ? 'Copying…' : 'Client Portal'}
                            </button>
                            <button
                                onClick={() => setIsEmailModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="group inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all duration-300 text-sm font-medium"
                            >
                                <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <div className="print:shadow-none print:p-0">
                        <InvoicePaper
                            invoice={invoice}
                            isEditable={false}
                            onChange={() => { }}
                            onDownloadPDF={handleDownloadPDF}
                            logoUpload={null}
                        />
                    </div>

                    {/* Payment History */}
                    {payments.length > 0 && (
                        <div className="mt-8 print:hidden">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment History
                            </h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map(payment => (
                                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                    {payment.paidAt
                                                        ? format(new Date(payment.paidAt), 'dd MMM yyyy')
                                                        : format(new Date(payment.createdAt), 'dd MMM yyyy')}
                                                </td>
                                                <td className="px-5 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                                    {payment.currency === 'NGN' ? '₦' : payment.currency === 'GBP' ? '£' : payment.currency === 'EUR' ? '€' : '$'}
                                                    {payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="capitalize text-sm text-gray-600">
                                                        {payment.provider || 'manual'}
                                                    </span>
                                                    {payment.reference && (
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[120px]">{payment.reference}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        payment.status === 'refunded'  ? 'bg-red-100 text-red-700' :
                                                        payment.status === 'failed'    ? 'bg-gray-100 text-gray-600' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {payment.status === 'completed' && (
                                                        <button
                                                            onClick={() => handleRefund(payment.id)}
                                                            disabled={refundingId === payment.id}
                                                            className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {refundingId === payment.id ? 'Refunding...' : 'Refund'}
                                                        </button>
                                                    )}
                                                    {payment.status === 'refunded' && (
                                                        <span className="text-xs text-gray-400">Refunded</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                {/* Activity / Audit Trail */}
                {events.length > 0 && (
                    <div className="mt-6 print:hidden">
                        <button
                            onClick={() => setShowActivity(v => !v)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 mb-3 group"
                        >
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Activity
                            <span className="text-xs text-gray-400 font-normal">({events.length})</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showActivity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showActivity && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                <ol className="relative border-l border-gray-200 ml-3 space-y-5">
                                    {events.map((event) => {
                                        const iconMap: Record<string, { icon: string; color: string }> = {
                                            created:          { icon: '✦', color: 'bg-emerald-100 text-emerald-600' },
                                            status_changed:   { icon: '⇄', color: 'bg-blue-100 text-blue-600' },
                                            total_changed:    { icon: '₊', color: 'bg-amber-100 text-amber-700' },
                                            due_date_changed: { icon: '📅', color: 'bg-purple-100 text-purple-600' },
                                            sent:             { icon: '✉', color: 'bg-sky-100 text-sky-600' },
                                            viewed:           { icon: '👁', color: 'bg-indigo-100 text-indigo-600' },
                                            payment_received: { icon: '✓', color: 'bg-emerald-100 text-emerald-600' },
                                            payment_refunded: { icon: '↩', color: 'bg-red-100 text-red-600' },
                                            edited:           { icon: '✎', color: 'bg-gray-100 text-gray-500' },
                                        };
                                        const cfg = iconMap[event.eventType] || iconMap.edited;
                                        return (
                                            <li key={event.id} className="ml-6">
                                                <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${cfg.color}`}>
                                                    {cfg.icon}
                                                </span>
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="text-sm text-gray-700">{event.description}</p>
                                                    <time className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                                        {format(new Date(event.createdAt), 'dd MMM yyyy, h:mm a')}
                                                    </time>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
            {invoice && (
                <SendEmailModal
                    invoiceId={invoice.id}
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    defaultEmail={invoice.client?.email || ''}
                />
            )}
        </>
    );
}
