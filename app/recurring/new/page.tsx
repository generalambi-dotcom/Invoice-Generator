'use client';

import React from 'react';
import RecurringInvoiceForm from '@/components/RecurringInvoiceForm';

export default function NewRecurringInvoicePage() {

    return (
        <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create Recurring Profile</h1>
                <p className="text-gray-500">Set up an invoice schedule to run automatically.</p>
            </div>

            <RecurringInvoiceForm />
        </div>
    );
}
