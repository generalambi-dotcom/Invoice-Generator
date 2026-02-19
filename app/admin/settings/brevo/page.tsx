'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ExternalLink, CheckCircle, XCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BrevoSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [status, setStatus] = useState<'configured' | 'not_configured'>('not_configured');

    const [apiKey, setApiKey] = useState('');
    const [listId, setListId] = useState('');
    const [popupEnabled, setPopupEnabled] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const headers: HeadersInit = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/admin/settings/brevo', { headers });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setListId(data.listId || '');
                setPopupEnabled(data.popupEnabled);
                // Don't populate the API key field with masked value
            }
        } catch (error) {
            console.error('Error fetching Brevo settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            toast.error('Please enter your Brevo API key');
            return;
        }
        setSaving(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/admin/settings/brevo', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    apiKey: apiKey.trim(),
                    listId: listId.trim(),
                    popupEnabled,
                }),
            });

            if (res.ok) {
                setStatus('configured');
                toast.success('Brevo settings saved successfully!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save Brevo settings');
            }
        } catch (error) {
            console.error('Error saving Brevo settings:', error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Mail className="w-6 h-6 text-blue-600" />
                                Newsletter Settings (Brevo)
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* ── Connection Status ── */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Brevo Integration</h2>
                                <p className="text-sm text-gray-500">
                                    Connect Brevo to collect newsletter subscribers from your site.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {status === 'configured' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle className="w-3.5 h-3.5" /> Connected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    <XCircle className="w-3.5 h-3.5" /> Not Configured
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Setup Instructions Toggle */}
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="w-full text-left mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-600 text-lg">📋</span>
                                <span className="text-sm font-medium text-blue-900">How to get your Brevo API key</span>
                            </div>
                            <svg className={`w-5 h-5 text-blue-500 transition-transform ${showInstructions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    {showInstructions && (
                        <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-lg space-y-4 text-sm">
                            <h3 className="font-semibold text-gray-900 text-base">Step-by-step setup guide</h3>
                            <ol className="space-y-4 text-gray-700">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Create a Brevo Account</p>
                                        <p className="text-gray-500 mt-0.5">
                                            Visit <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">brevo.com <ExternalLink className="w-3 h-3" /></a> and sign up for a free account (300 emails/day, unlimited contacts).
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Get your API Key</p>
                                        <p className="text-gray-500 mt-0.5">
                                            Go to <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Settings → SMTP & API → API Keys <ExternalLink className="w-3 h-3" /></a>. Click &quot;Generate a new API key&quot; and copy it.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Find your List ID (optional)</p>
                                        <p className="text-gray-500 mt-0.5">
                                            Go to <a href="https://app.brevo.com/contact/list" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Contacts → Lists <ExternalLink className="w-3 h-3" /></a>. Click on a list to see its ID in the URL, or create a new one (e.g. &quot;Newsletter Subscribers&quot;).
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Paste below and save</p>
                                        <p className="text-gray-500 mt-0.5">
                                            Paste your API key and list ID in the fields below. They&apos;ll be securely stored in your server environment.
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    )}

                    {/* Brevo API Key */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Brevo API Key <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="w-full px-3 py-2.5 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Your API key starts with <code className="bg-gray-100 px-1 rounded">xkeysib-</code>. Stored securely as an environment variable.
                            </p>
                        </div>

                        {/* List ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Contact List ID <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={listId}
                                onChange={(e) => setListId(e.target.value)}
                                placeholder="e.g. 2"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                If provided, subscribers will be added to this specific list. Otherwise they&apos;ll be added as general contacts.
                            </p>
                        </div>
                    </div>

                    {/* Popup Toggle */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label htmlFor="popup-toggle" className="text-sm font-medium text-gray-900 block">
                                    Newsletter Popup
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                    Show a popup to first-time visitors inviting them to subscribe. Appears once, then hidden for 7 days.
                                </p>
                            </div>
                            <button
                                type="button"
                                id="popup-toggle"
                                onClick={() => setPopupEnabled(!popupEnabled)}
                                className={`${popupEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                role="switch"
                                aria-checked={popupEnabled}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`${popupEnabled ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving || !apiKey.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> Settings are saved to the database and take effect <strong>immediately</strong>. No restart needed.
                    </p>
                </div>
            </div>
        </div>
    );
}
