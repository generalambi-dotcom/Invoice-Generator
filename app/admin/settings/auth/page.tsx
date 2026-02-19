
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Save, ArrowLeft, ExternalLink, CheckCircle, XCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AuthSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingGoogle, setSavingGoogle] = useState(false);
    const [showClientId, setShowClientId] = useState(false);
    const [copied, setCopied] = useState(false);
    const [googleStatus, setGoogleStatus] = useState<'configured' | 'not_configured'>('not_configured');
    const [googleClientId, setGoogleClientId] = useState('');
    const [googleClientSecret, setGoogleClientSecret] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [settings, setSettings] = useState({
        emailVerificationRequired: true,
    });

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
            const res = await fetch('/api/admin/settings/auth', {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data.settings);
                // Check Google OAuth status
                if (data.googleOAuth) {
                    setGoogleStatus(data.googleOAuth.status);
                }
            }

            // Also fetch saved Google OAuth credentials for form population
            const goRes = await fetch('/api/admin/settings/google-oauth', {
                headers: getAuthHeaders(),
            });
            if (goRes.ok) {
                const goData = await goRes.json();
                setGoogleStatus(goData.status);
                if (goData.clientId) {
                    setGoogleClientId(goData.clientId);
                }
                // Show indicator that secret exists (don't overwrite with masked value)
                if (goData.hasSecret) {
                    setGoogleClientSecret('••••••••••••••••');
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings/auth', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                toast.success('Settings saved successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveGoogle = async () => {
        if (!googleClientId.trim()) {
            toast.error('Please enter the Google Client ID');
            return;
        }
        setSavingGoogle(true);
        try {
            const res = await fetch('/api/admin/settings/google-oauth', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    clientId: googleClientId.trim(),
                    // Don't send the masked placeholder as the actual secret
                    clientSecret: googleClientSecret.includes('••') ? '' : googleClientSecret.trim(),
                }),
            });

            if (res.ok) {
                setGoogleStatus('configured');
                toast.success('Google OAuth credentials saved successfully!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save Google OAuth credentials');
            }
        } catch (error) {
            console.error('Error saving Google OAuth:', error);
            toast.error('An error occurred');
        } finally {
            setSavingGoogle(false);
        }
    };

    const handleCopyEnvVar = () => {
        const envText = `NEXT_PUBLIC_GOOGLE_CLIENT_ID=${googleClientId}\nGOOGLE_CLIENT_SECRET=${googleClientSecret}`;
        navigator.clipboard.writeText(envText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-indigo-600" />
                                Auth Settings
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* ── Email Verification Section ── */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Email Verification</h2>
                            <p className="text-sm text-gray-500">Configure how new user accounts are verified.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label htmlFor="email-verification" className="text-sm font-medium text-gray-900 block">
                                    Require Email Verification
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                    If enabled, users must verify their email address before accessing the dashboard.
                                    If disabled, users are automatically verified upon registration.
                                </p>
                            </div>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, emailVerificationRequired: !settings.emailVerificationRequired })}
                                    className={`${settings.emailVerificationRequired ? 'bg-indigo-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                    role="switch"
                                    aria-checked={settings.emailVerificationRequired}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`${settings.emailVerificationRequired ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* ── Google Sign-In Section ── */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Google Sign-In</h2>
                                <p className="text-sm text-gray-500">Allow users to sign in with their Google accounts.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {googleStatus === 'configured' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle className="w-3.5 h-3.5" /> Active
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
                                <span className="text-sm font-medium text-blue-900">How to get your Google Client ID</span>
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
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Go to Google Cloud Console</p>
                                        <p className="text-gray-500 mt-0.5">Visit <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">console.cloud.google.com <ExternalLink className="w-3 h-3" /></a> and sign in with your Google account.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Create a Project (or select existing)</p>
                                        <p className="text-gray-500 mt-0.5">Click the project dropdown at the top and create a new project (e.g., &quot;InvoiceGenerator&quot;) or select your existing one.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Configure OAuth Consent Screen</p>
                                        <p className="text-gray-500 mt-0.5">Go to <strong>APIs & Services → OAuth consent screen</strong>. Choose &quot;External&quot; user type. Fill in your app name, support email, and save.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">4</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Create OAuth 2.0 Credentials</p>
                                        <p className="text-gray-500 mt-0.5">Go to <strong>APIs & Services → Credentials</strong>. Click <strong>&quot;+ Create Credentials&quot; → &quot;OAuth client ID&quot;</strong>. Choose &quot;Web application&quot; as the type.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">5</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Set Authorized Origins & Redirects</p>
                                        <div className="text-gray-500 mt-0.5 space-y-1">
                                            <p>Add these <strong>Authorized JavaScript origins</strong>:</p>
                                            <code className="block bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-800 font-mono">https://yourdomain.com</code>
                                            <code className="block bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-800 font-mono">http://localhost:3000 <span className="text-gray-400">(for development)</span></code>
                                            <p className="mt-2">Add these <strong>Authorized redirect URIs</strong>:</p>
                                            <code className="block bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-800 font-mono">https://yourdomain.com/api/auth/google</code>
                                            <code className="block bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-800 font-mono">http://localhost:3000/api/auth/google <span className="text-gray-400">(for development)</span></code>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">6</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Copy your Client ID & Secret</p>
                                        <p className="text-gray-500 mt-0.5">After creation, Google will show your <strong>Client ID</strong> (ends in <code className="text-xs bg-white border px-1 rounded">.apps.googleusercontent.com</code>) and <strong>Client Secret</strong>. Copy both and paste them below.</p>
                                    </div>
                                </li>
                            </ol>

                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-800">
                                    <strong>⚠️ Important:</strong> After saving, you must <strong>restart your server</strong> (<code className="bg-amber-100/80 px-1 rounded">npm run dev</code> or redeploy) for Google Sign-In to activate. Environment variables are loaded at server startup.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Google Client ID input */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Google Client ID <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showClientId ? 'text' : 'password'}
                                    value={googleClientId}
                                    onChange={(e) => setGoogleClientId(e.target.value)}
                                    placeholder="123456789-xxxx.apps.googleusercontent.com"
                                    className="w-full px-3 py-2.5 pr-20 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowClientId(!showClientId)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showClientId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">This will be stored as <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your environment.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Google Client Secret <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="password"
                                value={googleClientSecret}
                                onChange={(e) => setGoogleClientSecret(e.target.value)}
                                placeholder="GOCSPX-xxxxxxxxxxxx"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                            />
                            <p className="text-xs text-gray-400 mt-1">Required for server-side token verification. Stored as <code className="bg-gray-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            onClick={handleCopyEnvVar}
                            disabled={!googleClientId.trim()}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? 'Copied!' : 'Copy as .env variables'}
                        </button>

                        <button
                            onClick={handleSaveGoogle}
                            disabled={savingGoogle || !googleClientId.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {savingGoogle ? 'Saving...' : 'Save & Update .env'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
