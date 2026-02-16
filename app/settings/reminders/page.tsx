'use client';

import React from 'react';
import ReminderSettings from '@/components/settings/ReminderSettings';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function RemindersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Invoice Reminders</h1>
            <ReminderSettings />
        </div>
    );
}
