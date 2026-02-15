'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RecurringInvoiceForm from '@/components/RecurringInvoiceForm';

export default function EditRecurringInvoicePage({ params }: { params: { id: string } }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Unwrap params if necessary (Next.js 13+ behavior variability)
        // Simply accessing params.id is usually fine in client components if passed as prop
        fetchInvoice();
    }, [params.id]);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/recurring-invoices/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setInvoice(data);
            } else {
                console.error('Failed to load invoice');
                router.push('/recurring');
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} title="Edit Recurring Invoice" />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Edit Recurring Profile</h1>
                            <p className="text-gray-500">Update schedule or invoice details.</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : invoice ? (
                            <RecurringInvoiceForm initialData={invoice} isEditing={true} />
                        ) : (
                            <p>Invoice not found.</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
