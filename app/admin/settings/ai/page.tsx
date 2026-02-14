'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bot, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const PROVIDERS = [
    { id: 'openai', name: 'OpenAI (ChatGPT)', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic (Claude)', models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
    { id: 'qwen', name: 'Alibaba Qwen', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
];

export default function AISettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [settings, setSettings] = useState({
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o',
        isEnabled: false,
        useSmartContext: true,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/ai');
            const data = await res.json();
            if (data.settings) {
                setSettings({
                    provider: data.settings.provider,
                    apiKey: data.settings.apiKey || '', // It comes back masked
                    model: data.settings.model || 'gpt-4o',
                    isEnabled: data.settings.isEnabled,
                    useSmartContext: data.settings.useSmartContext ?? true,
                });
            }
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'test',
                    provider: settings.provider,
                    apiKey: settings.apiKey,
                    model: settings.model,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: '✅ Connection successful! ' + data.message });
            } else {
                setMessage({ type: 'error', text: '❌ Connection failed: ' + data.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to test connection' });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    action: 'save'
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                // Refresh to get potentially new masked key state if needed, though local state is fine
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const selectedProvider = PROVIDERS.find(p => p.id === settings.provider) || PROVIDERS[0];

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bot className="w-8 h-8 text-blue-600" />
                    AI & LLM Configuration
                </h1>
                <p className="text-gray-500 mt-2">
                    Configure the AI model used for natural language invoice parsing on WhatsApp.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Enabled Toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-900">Enable AI Parsing</h3>
                                <p className="text-sm text-gray-500">Use this LLM to parse incoming messages</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.isEnabled}
                                    onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div>
                                <h3 className="font-semibold text-blue-900">Smart Context (RAG)</h3>
                                <p className="text-sm text-blue-700">Inject client & item history into AI prompt</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.useSmartContext}
                                    onChange={(e) => setSettings({ ...settings, useSmartContext: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Provider Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
                            <select
                                value={settings.provider}
                                onChange={(e) => setSettings({ ...settings, provider: e.target.value, model: PROVIDERS.find(p => p.id === e.target.value)?.models[0] || '' })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {PROVIDERS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Model Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                            <select
                                value={settings.model}
                                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {selectedProvider.models.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                                {/* Fallback to text input for custom models? */}
                                <option value="custom">Custom...</option>
                            </select>
                            {settings.model === 'custom' && (
                                <input
                                    type="text"
                                    placeholder="Enter custom model name"
                                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={settings.apiKey}
                                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                placeholder={settings.apiKey.startsWith('...') ? '••••••••••••••••' : `Enter your ${selectedProvider.name} API Key`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Your key is encrypted before storage. Leave unchanged to keep existing key.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleTestConnection}
                            disabled={testing || !settings.apiKey}
                            className="px-6 py-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                            Test Connection
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
