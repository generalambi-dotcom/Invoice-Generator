'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RecurringInvoiceForm from '@/components/RecurringInvoiceForm';
import { getCurrentUser } from '@/lib/auth';

export default function NewRecurringInvoicePage() {
    const router = useRouter();
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        const premium = user?.isAdmin === true ||
            (user?.subscription?.plan === 'premium' &&
                user?.subscription?.status === 'active');

        if (!premium) {
            router.push('/upgrade');
            return;
        }

        setIsPremium(true);
    }, []);

    if (!isPremium) return null; // Or a loading spinner

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
