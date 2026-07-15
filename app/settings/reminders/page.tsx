'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isPremiumUser } from '@/lib/payments';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';

interface ReminderSettings {
    enableEmail: boolean;
    enableWhatsApp: boolean;
    remindBeforeDue: number | null;
    remindOnDue: boolean;
    remindAfterDue1: number | null;
    remindAfterDue2: number | null;
}

export default function RemindersSettings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    const [settings, setSettings] = useState<ReminderSettings>({
        enableEmail: false,
        enableWhatsApp: false,
        remindBeforeDue: 3,
        remindOnDue: true,
        remindAfterDue1: 3,
        remindAfterDue2: 7,
    });

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/signin');
            return;
        }
        const premiumStatus = isPremiumUser();
        setIsPremium(premiumStatus);

        if (premiumStatus) {
            loadSettings();
        } else {
            setLoading(false);
        }
    }, [router]);

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/settings/reminders');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Failed to load reminder settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/settings/reminders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            toast.success('Reminder settings saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!isPremium) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Automated reminders are on Pro</h2>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">Follow up before and after an invoice is due, while keeping control of the schedule.</p>
                            <button onClick={() => router.push('/upgrade')} className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-colors shadow-sm">
                                View Pro plans
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-white sm:flex sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-semibold text-gray-900">Automatic payment reminders</h3>
                                <p className="mt-1 text-sm text-gray-500">Nothing is sent until you switch reminders on and save.</p>
                            </div>
                            <div className="mt-3 flex sm:mt-0 sm:ml-4">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-6 space-y-8">
                            {/* Email Toggle */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Enable Email Reminders</h4>
                                        <p className="text-sm text-gray-500">Automatically send emails based on the schedule below.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings.enableEmail} onChange={(e) => setSettings({ ...settings, enableEmail: e.target.checked })} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </label>
                                </div>
                            </div>

                            {settings.enableEmail && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <h4 className="text-base font-medium text-gray-900">Reminder Schedule</h4>

                                    {/* Before Due */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="remindBefore"
                                                checked={settings.remindBeforeDue !== null}
                                                onChange={(e) => setSettings({ ...settings, remindBeforeDue: e.target.checked ? 3 : null })}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="remindBefore" className="ml-3 block text-sm font-medium text-gray-700">Before due date</label>
                                        </div>
                                        {settings.remindBeforeDue !== null && (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="30"
                                                    value={settings.remindBeforeDue}
                                                    onChange={(e) => setSettings({ ...settings, remindBeforeDue: parseInt(e.target.value) || 1 })}
                                                    className="w-16 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                                />
                                                <span className="text-sm text-gray-500">days before</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* On Due */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="remindOn"
                                                checked={settings.remindOnDue}
                                                onChange={(e) => setSettings({ ...settings, remindOnDue: e.target.checked })}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="remindOn" className="ml-3 block text-sm font-medium text-gray-700">On the due date</label>
                                        </div>
                                    </div>

                                    {/* After Due 1 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="remindAfter1"
                                                checked={settings.remindAfterDue1 !== null}
                                                onChange={(e) => setSettings({ ...settings, remindAfterDue1: e.target.checked ? 3 : null })}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="remindAfter1" className="ml-3 block text-sm font-medium text-gray-700">First overdue reminder</label>
                                        </div>
                                        {settings.remindAfterDue1 !== null && (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="90"
                                                    value={settings.remindAfterDue1}
                                                    onChange={(e) => setSettings({ ...settings, remindAfterDue1: parseInt(e.target.value) || 1 })}
                                                    className="w-16 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                                />
                                                <span className="text-sm text-gray-500">days after</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* After Due 2 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="remindAfter2"
                                                checked={settings.remindAfterDue2 !== null}
                                                onChange={(e) => setSettings({ ...settings, remindAfterDue2: e.target.checked ? 7 : null })}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="remindAfter2" className="ml-3 block text-sm font-medium text-gray-700">Second overdue reminder</label>
                                        </div>
                                        {settings.remindAfterDue2 !== null && (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="90"
                                                    value={settings.remindAfterDue2}
                                                    onChange={(e) => setSettings({ ...settings, remindAfterDue2: parseInt(e.target.value) || 1 })}
                                                    className="w-16 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                                />
                                                <span className="text-sm text-gray-500">days after</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
