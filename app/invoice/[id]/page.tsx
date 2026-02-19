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

export default function InvoiceViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await fetch(`/api/invoices/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to load invoice');
                }
                const data = await response.json();
                setInvoice(data.invoice);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInvoice();
        }
    }, [id]);

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
                                Edit Invoice
                            </button>
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
