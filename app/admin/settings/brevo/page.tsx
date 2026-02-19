'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ExternalLink, CheckCircle, XCircle, Eye, EyeOff, Mail, Palette, Layout, Clock, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLOR_OPTIONS = [
    { value: 'blue', label: 'Blue', preview: 'from-blue-600 to-indigo-600' },
    { value: 'green', label: 'Green', preview: 'from-emerald-600 to-green-600' },
    { value: 'purple', label: 'Purple', preview: 'from-purple-600 to-violet-600' },
    { value: 'orange', label: 'Orange', preview: 'from-orange-500 to-amber-500' },
    { value: 'red', label: 'Red', preview: 'from-red-600 to-rose-600' },
    { value: 'dark', label: 'Dark', preview: 'from-gray-800 to-black' },
];

const POSITION_OPTIONS = [
    { value: 'center', label: 'Center Modal', description: 'Full-screen centered overlay' },
    { value: 'bottom-right', label: 'Bottom Right', description: 'Compact popup in the corner' },
    { value: 'bottom-left', label: 'Bottom Left', description: 'Compact popup on the left' },
];

export default function BrevoSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showPopupConfig, setShowPopupConfig] = useState(false);
    const [status, setStatus] = useState<'configured' | 'not_configured'>('not_configured');

    const [apiKey, setApiKey] = useState('');
    const [listId, setListId] = useState('');
    const [popupEnabled, setPopupEnabled] = useState(true);

    // Popup customization
    const [popupHeading, setPopupHeading] = useState('Stay in the Loop!');
    const [popupSubtitle, setPopupSubtitle] = useState('Get invoicing tips, product updates, and exclusive offers delivered to your inbox.');
    const [popupButtonText, setPopupButtonText] = useState('Subscribe Now 🚀');
    const [popupSuccessMsg, setPopupSuccessMsg] = useState('Thanks for joining our newsletter.');
    const [popupAccentColor, setPopupAccentColor] = useState('blue');
    const [popupPosition, setPopupPosition] = useState('center');
    const [popupDelay, setPopupDelay] = useState(8);
    const [popupCooldown, setPopupCooldown] = useState(7);
    const [popupShowName, setPopupShowName] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const getAuthHeaders = (): HeadersInit => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings/brevo', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setListId(data.listId || '');
                setPopupEnabled(data.popupEnabled);
                // Populate popup customization
                if (data.popup) {
                    if (data.popup.heading) setPopupHeading(data.popup.heading);
                    if (data.popup.subtitle) setPopupSubtitle(data.popup.subtitle);
                    if (data.popup.buttonText) setPopupButtonText(data.popup.buttonText);
                    if (data.popup.successMessage) setPopupSuccessMsg(data.popup.successMessage);
                    if (data.popup.accentColor) setPopupAccentColor(data.popup.accentColor);
                    if (data.popup.position) setPopupPosition(data.popup.position);
                    if (data.popup.delaySeconds !== undefined) setPopupDelay(data.popup.delaySeconds);
                    if (data.popup.cooldownDays !== undefined) setPopupCooldown(data.popup.cooldownDays);
                    if (data.popup.showNameField !== undefined) setPopupShowName(data.popup.showNameField);
                }
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
            const res = await fetch('/api/admin/settings/brevo', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    apiKey: apiKey.trim(),
                    listId: listId.trim(),
                    popupEnabled,
                    popup: {
                        heading: popupHeading,
                        subtitle: popupSubtitle,
                        buttonText: popupButtonText,
                        successMessage: popupSuccessMsg,
                        accentColor: popupAccentColor,
                        position: popupPosition,
                        delaySeconds: popupDelay,
                        cooldownDays: popupCooldown,
                        showNameField: popupShowName,
                    },
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
                {/* ── Connection & API Keys ── */}
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
                                <p className="text-sm text-gray-500">Connect Brevo to collect newsletter subscribers.</p>
                            </div>
                        </div>
                        <div>
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
                                        <p className="text-gray-500 mt-0.5">Visit <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">brevo.com <ExternalLink className="w-3 h-3" /></a> and sign up.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Get your API Key</p>
                                        <p className="text-gray-500 mt-0.5">Go to <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Settings → SMTP &amp; API → API Keys <ExternalLink className="w-3 h-3" /></a></p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Find your List ID (optional)</p>
                                        <p className="text-gray-500 mt-0.5">Go to <a href="https://app.brevo.com/contact/list" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Contacts → Lists <ExternalLink className="w-3 h-3" /></a></p>
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
                            <p className="text-xs text-gray-400 mt-1">Starts with <code className="bg-gray-100 px-1 rounded">xkeysib-</code></p>
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
                            <p className="text-xs text-gray-400 mt-1">Subscribers will be added to this list.</p>
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
                                    Show a popup to first-time visitors inviting them to subscribe.
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
                </div>

                {/* ── Popup Customization ── */}
                {popupEnabled && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <button
                            onClick={() => setShowPopupConfig(!showPopupConfig)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-medium text-gray-900">Popup Customization</h2>
                                    <p className="text-sm text-gray-500">Configure the look, feel, and content of the popup.</p>
                                </div>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPopupConfig ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showPopupConfig && (
                            <div className="mt-6 space-y-8">
                                {/* ─── Content ─── */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-gray-500" /> Content
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                                            <input
                                                type="text"
                                                value={popupHeading}
                                                onChange={(e) => setPopupHeading(e.target.value)}
                                                placeholder="Stay in the Loop!"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                            <textarea
                                                value={popupSubtitle}
                                                onChange={(e) => setPopupSubtitle(e.target.value)}
                                                placeholder="Get invoicing tips, product updates..."
                                                rows={2}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                                <input
                                                    type="text"
                                                    value={popupButtonText}
                                                    onChange={(e) => setPopupButtonText(e.target.value)}
                                                    placeholder="Subscribe Now 🚀"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
                                                <input
                                                    type="text"
                                                    value={popupSuccessMsg}
                                                    onChange={(e) => setPopupSuccessMsg(e.target.value)}
                                                    placeholder="Thanks for joining!"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ─── Style ─── */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-gray-500" /> Style
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Accent Color */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {COLOR_OPTIONS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() => setPopupAccentColor(c.value)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm ${popupAccentColor === c.value
                                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${c.preview}`} />
                                                        <span className="font-medium text-gray-700">{c.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Show Name Field */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="text-sm font-medium text-gray-900 block">Show Name Field</label>
                                                <p className="text-xs text-gray-500 mt-0.5">Include an optional name field in the popup form.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPopupShowName(!popupShowName)}
                                                className={`${popupShowName ? 'bg-blue-600' : 'bg-gray-200'
                                                    } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
                                                role="switch"
                                                aria-checked={popupShowName}
                                            >
                                                <span className={`${popupShowName ? 'translate-x-4' : 'translate-x-0'
                                                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* ─── Layout ─── */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Layout className="w-4 h-4 text-gray-500" /> Layout & Position
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {POSITION_OPTIONS.map(p => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => setPopupPosition(p.value)}
                                                className={`p-4 rounded-lg border-2 text-left transition-all ${popupPosition === p.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-sm font-medium text-gray-900">{p.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{p.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ─── Timing ─── */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" /> Timing
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delay before showing <span className="text-gray-400">(seconds)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={popupDelay}
                                                onChange={(e) => setPopupDelay(Math.max(0, parseInt(e.target.value) || 0))}
                                                min="0"
                                                max="120"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">How long to wait before showing the popup (0 = immediately).</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cooldown period <span className="text-gray-400">(days)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={popupCooldown}
                                                onChange={(e) => setPopupCooldown(Math.max(1, parseInt(e.target.value) || 1))}
                                                min="1"
                                                max="365"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Days before showing again after dismissal.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || !apiKey.trim()}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </button>
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
