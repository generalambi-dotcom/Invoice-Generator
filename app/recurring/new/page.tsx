'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RecurringInvoiceForm from '@/components/RecurringInvoiceForm';

export default function NewRecurringInvoicePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} title="New Recurring Invoice" />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Create Recurring Profile</h1>
                            <p className="text-gray-500">Set up an invoice schedule to run automatically.</p>
                        </div>

                        <RecurringInvoiceForm />
                    </div>
                </main>
            </div>
        </div>
    );
}
