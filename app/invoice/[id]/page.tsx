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

    // Payment history
    const [payments, setPayments] = useState<any[]>([]);
    const [refundingId, setRefundingId] = useState<string | null>(null);

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
                    const pRes = await fetch(`/api/invoices/${id}/payments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        setPayments(pData.payments || []);
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
                                <p className="text-sm text-gray-500">
                                    Created on {new Date(invoice.createdAt || invoice.invoiceDate).toLocaleDateString()}
                                </p>
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
