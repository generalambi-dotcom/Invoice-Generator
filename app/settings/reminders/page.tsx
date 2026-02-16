'use client';

import React, { useEffect, useState } from 'react';
import ReminderSettings from '@/components/settings/ReminderSettings';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RemindersPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/signin');
            return;
        }
        setUser(currentUser);
        setLoading(false);
    }, [router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (!user) {
        return null; // Redirecting
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Invoice Reminders</h1>
            <ReminderSettings />
        </div>
    );
}
