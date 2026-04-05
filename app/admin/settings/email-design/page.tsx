'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Mail, Palette, Layout, Type, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EmailDesignSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const [brandLogo, setBrandLogo] = useState('');
    const [brandName, setBrandName] = useState('Invoice Generator');
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [headerBg, setHeaderBg] = useState('#ffffff');
    const [footerText, setFooterText] = useState('');
    const [showPoweredBy, setShowPoweredBy] = useState(true);

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
            const res = await fetch('/api/admin/settings/email-design', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setBrandLogo(data.brandLogo || '');
                setBrandName(data.brandName || 'Invoice Generator');
                setPrimaryColor(data.primaryColor || '#4F46E5');
                setHeaderBg(data.headerBg || '#ffffff');
                setFooterText(data.footerText || '');
                setShowPoweredBy(data.showPoweredBy);
            }
        } catch (error) {
            console.error('Error fetching email design settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings/email-design', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    brandLogo,
                    brandName,
                    primaryColor,
                    headerBg,
                    footerText,
                    showPoweredBy,
                }),
            });

            if (res.ok) {
                toast.success('Email design settings saved!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail) {
            toast.error('Please enter an email address');
            return;
        }
        setSendingTest(true);
        try {
            const res = await fetch('/api/admin/email-notifications/test', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    to: testEmail,
                    templateKey: 'welcome_email', // Use welcome email as the test
                }),
            });

            if (res.ok) {
                toast.success(`Test email sent to ${testEmail}`);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to send test email');
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            toast.error('Failed to send test email');
        } finally {
            setSendingTest(false);
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Palette className="w-6 h-6 text-purple-600" />
                                Email Design
                            </h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Settings */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Branding */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-gray-400" /> Branding
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                    <input
                                        type="url"
                                        value={brandLogo}
                                        onChange={(e) => setBrandLogo(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to use Brand Name as text.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <input
                                        type="text"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        placeholder="Invoice Generator"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used in email footer and as header text if no logo is provided.</p>
                                </div>
                            </div>
                        </section>

                        {/* Colors */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-gray-400" /> Colors
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="uppercase w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and accents.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Background</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={headerBg}
                                            onChange={(e) => setHeaderBg(e.target.value)}
                                            className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={headerBg}
                                            onChange={(e) => setHeaderBg(e.target.value)}
                                            className="uppercase w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Background color for the logo/header area.</p>
                                </div>
                            </div>
                        </section>

                        {/* Footer */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-gray-400" /> Footer
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Footer Text</label>
                                    <textarea
                                        value={footerText}
                                        onChange={(e) => setFooterText(e.target.value)}
                                        placeholder="123 Example Street, Lagos, Nigeria"
                                        rows={3}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">HTML is allowed. This appears above the copyright line.</p>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 block">Show "Powered by Invoice Generator"</label>
                                        <p className="text-xs text-gray-500 mt-0.5">Show a small credit link in the footer.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPoweredBy(!showPoweredBy)}
                                        className={`${showPoweredBy ? 'bg-purple-600' : 'bg-gray-200'
                                            } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                                    >
                                        <span
                                            className={`${showPoweredBy ? 'translate-x-4' : 'translate-x-0'
                                                } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Preview/Test */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Live Preview Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Live Preview
                                </h3>
                            </div>

                            <div className="p-0 bg-gray-100 min-h-[300px] flex flex-col items-center">
                                {/* Email Container Simulation */}
                                <div className="w-full max-w-[320px] my-6 bg-white rounded shadow-sm overflow-hidden text-sm">
                                    {/* Header */}
                                    <div style={{ backgroundColor: headerBg }} className="p-4 border-b border-gray-100 text-center">
                                        {brandLogo ? (
                                            <img src={brandLogo} alt="Logo" className="h-8 mx-auto object-contain" />
                                        ) : (
                                            <h1 style={{ color: primaryColor }} className="text-lg font-bold m-0">{brandName}</h1>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <h2 className="text-base font-bold text-gray-900">Welcome to {brandName}!</h2>
                                        <p className="text-gray-600 text-xs leading-relaxed">
                                            This is a preview of how your emails will look. The colors and branding you choose will appear like this.
                                        </p>
                                        <div className="py-2 text-center">
                                            <button
                                                style={{ backgroundColor: primaryColor }}
                                                className="px-4 py-2 text-white rounded text-xs font-semibold"
                                            >
                                                Call to Action
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                                        {footerText && <div className="text-[10px] text-gray-500 mb-2" dangerouslySetInnerHTML={{ __html: footerText }} />}
                                        <div className="text-[10px] text-gray-400">
                                            &copy; {new Date().getFullYear()} {brandName}.
                                        </div>
                                        {showPoweredBy && (
                                            <div className="mt-2 text-[10px] text-gray-300">
                                                Powered by Invoice Generator
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Test Send */}
                            <div className="p-4 border-t border-gray-200">
                                <h4 className="text-xs font-medium text-gray-600 mb-2">Send Test Email</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <button
                                        onClick={handleSendTest}
                                        disabled={sendingTest || !testEmail}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
                                    >
                                        {sendingTest ? '...' : 'Send'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    <span className="text-amber-500">⚠</span> Save settings before testing.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
