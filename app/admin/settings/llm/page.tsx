'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Shield, KeyRound, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LLMSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'configured' | 'not_configured'>('not_configured');

    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [isPristineKey, setIsPristineKey] = useState(true);

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
            const res = await fetch('/api/admin/settings/llm', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setProvider(data.provider || 'openai');
                setApiKey(data.apiKey || ''); // Note: The API returns a masked key like 'sk-••••'
                setIsPristineKey(!!data.apiKey);
            }
        } catch (error) {
            console.error('Error fetching LLM settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Only enforce API key validation if the user changed it or if there wasn't one at all
        if (!isPristineKey && !apiKey.trim()) {
            toast.error('Please enter your API key');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings/llm', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    provider,
                    apiKey: isPristineKey ? undefined : apiKey.trim(),
                    isUpdateKey: !isPristineKey
                }),
            });

            if (res.ok) {
                setStatus('configured');
                setIsPristineKey(true); // Treat current input state as the new pristine state
                toast.success('AI generation settings saved successfully!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving LLM settings:', error);
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
                                <Cpu className="w-6 h-6 text-emerald-600" />
                                AI Invoice Generation
                            </h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Large Language Model (LLM) Settings</h2>
                            <p className="text-sm text-gray-500 max-w-2xl">
                                Configure the AI Provider that powers the "Create with AI" automatic invoice drafting feature.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                            <div className={`w-2.5 h-2.5 rounded-full ${status === 'configured' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium text-gray-700">
                                {status === 'configured' ? 'Connected' : 'Not Configured'}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Provider Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setProvider('openai')}
                                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${provider === 'openai' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                            >
                                <span className={`text-sm font-bold block mb-1 ${provider === 'openai' ? 'text-emerald-900' : 'text-gray-900'}`}>OpenAI</span>
                                <span className="text-xs text-gray-500 text-left">GPT-4o (Strongest performance and reasoning, recommended)</span>
                            </button>

                            <button
                                onClick={() => setProvider('deepseek')}
                                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${provider === 'deepseek' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                            >
                                <span className={`text-sm font-bold block mb-1 ${provider === 'deepseek' ? 'text-emerald-900' : 'text-gray-900'}`}>Deepseek</span>
                                <span className="text-xs text-gray-500 text-left">Deepseek Chat (Cost-effective open-weights alternative)</span>
                            </button>
                        </div>

                        {/* API Key */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Key ({provider === 'openai' ? 'starts with sk-...' : 'starts with sk-...'})
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        setIsPristineKey(false);
                                    }}
                                    placeholder={provider === 'openai' ? "sk-proj-xxxxxxxxxxxxxxxxxxxx" : "sk-xxxxxxxxxxxxxxxx"}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50 text-gray-900 font-mono"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                Your API key is encrypted and stored securely in your database.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
