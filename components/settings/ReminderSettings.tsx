'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ReminderSettings {
    enableEmail: boolean;
    enableWhatsApp: boolean;
    remindBeforeDue: number | null;
    remindOnDue: boolean;
    remindAfterDue1: number | null;
    remindAfterDue2: number | null;
}

export default function ReminderSettings() {
    const [settings, setSettings] = useState<ReminderSettings>({
        enableEmail: true,
        enableWhatsApp: false,
        remindBeforeDue: 3,
        remindOnDue: true,
        remindAfterDue1: 3,
        remindAfterDue2: 7,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/reminders');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (key: keyof ReminderSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key: keyof ReminderSettings, value: string) => {
        const numValue = value === '' ? null : parseInt(value, 10);
        setSettings(prev => ({ ...prev, [key]: numValue }));
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/reminders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-4">Loading settings...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Automated Invoice Reminders
            </h2>

            <p className="text-gray-600 mb-8">
                Configure automated reminders to help you get paid faster. We'll send notifications to your clients based on these rules.
            </p>

            {/* Channels */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Notification Channels</h3>
                <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.enableEmail}
                            onChange={() => handleToggle('enableEmail')}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Enable Email Reminders</span>
                    </label>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableWhatsApp}
                                onChange={() => handleToggle('enableWhatsApp')}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-gray-700">Enable WhatsApp Reminders</span>
                        </label>
                        {!settings.enableWhatsApp && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Requires WhatsApp Connection</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="space-y-6">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Reminder Schedule</h3>

                {/* Before Due */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Before Due Date</p>
                        <p className="text-sm text-gray-500">Send a friendly reminder before the invoice is due.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={settings.remindBeforeDue || ''}
                            onChange={(e) => handleChange('remindBeforeDue', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Days"
                        />
                        <span className="text-gray-600">days before</span>
                    </div>
                </div>

                {/* On Due Date */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">On Due Date</p>
                        <p className="text-sm text-gray-500">Send a reminder on the day the invoice is due.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.remindOnDue}
                            onChange={() => handleToggle('remindOnDue')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Overdue 1 */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">First Overdue Reminder</p>
                        <p className="text-sm text-gray-500">Send a reminder when payment is late.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={settings.remindAfterDue1 || ''}
                            onChange={(e) => handleChange('remindAfterDue1', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Days"
                        />
                        <span className="text-gray-600">days after</span>
                    </div>
                </div>

                {/* Overdue 2 */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Second Overdue Reminder</p>
                        <p className="text-sm text-gray-500">Send a follow-up reminder for overdue payments.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            min="1"
                            max="90"
                            value={settings.remindAfterDue2 || ''}
                            onChange={(e) => handleChange('remindAfterDue2', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Days"
                        />
                        <span className="text-gray-600">days after</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
