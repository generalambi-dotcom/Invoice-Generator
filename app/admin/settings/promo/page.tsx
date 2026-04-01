'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Megaphone, Type, Clock, Link as LinkIcon, Palette, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PromoBanner from '@/components/PromoBanner';

export default function PromoSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [text, setText] = useState('');
    const [endDate, setEndDate] = useState('');
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [bgColor, setBgColor] = useState('#52e85a');

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
            const res = await fetch('/api/admin/settings/promo', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setEnabled(data.enabled || false);
                setText(data.text || '');
                // Format date for datetime-local input
                if (data.endDate) {
                    const date = new Date(data.endDate);
                    // Adjust to local time string format "YYYY-MM-DDThh:mm"
                    const offset = date.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
                    setEndDate(localISOTime);
                }
                setLinkText(data.linkText || '');
                setLinkUrl(data.linkUrl || '');
                setBgColor(data.bgColor || '#52e85a');
            }
        } catch (error) {
            console.error('Error fetching promo settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const isoDate = new Date(endDate).toISOString();
            const res = await fetch('/api/admin/settings/promo', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    enabled,
                    text,
                    endDate: isoDate,
                    linkText,
                    linkUrl,
                    bgColor,
                }),
            });

            if (res.ok) {
                toast.success('Promo banner settings saved!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving promo settings:', error);
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
                                <Megaphone className="w-6 h-6 text-purple-600" />
                                Promo Banner
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
                
                {/* Simulated Header Preview */}
                <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Live Header Preview
                        </h3>
                    </div>
                    {/* Render the actual component by passing a mock config script or overriding state if we could, 
                        but to keep it isolated we just render a localized version based on current state */}
                    {enabled && (
                        <div 
                            className="w-full relative py-6 px-4 text-center text-gray-900 border-b border-gray-200/50"
                            style={{ backgroundColor: bgColor }}
                        >
                            <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
                                <div className="flex items-center gap-2 mb-4 bg-white/10 p-2 rounded-lg backdrop-blur-sm shadow-sm inline-flex">
                                    <div className="flex flex-col items-center justify-center bg-white rounded-md w-14 h-14 md:w-16 md:h-16 shadow-sm"><span className="text-xl md:text-2xl font-bold leading-none mb-1 text-gray-900">08</span><span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-medium">DAYS</span></div>
                                    <div className="flex flex-col items-center justify-center bg-white rounded-md w-14 h-14 md:w-16 md:h-16 shadow-sm"><span className="text-xl md:text-2xl font-bold leading-none mb-1 text-gray-900">04</span><span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-medium">HOURS</span></div>
                                    <div className="flex flex-col items-center justify-center bg-white rounded-md w-14 h-14 md:w-16 md:h-16 shadow-sm"><span className="text-xl md:text-2xl font-bold leading-none mb-1 text-gray-900">44</span><span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-medium">MINS</span></div>
                                    <div className="flex flex-col items-center justify-center bg-white rounded-md w-14 h-14 md:w-16 md:h-16 shadow-sm"><span className="text-xl md:text-2xl font-bold leading-none mb-1 text-gray-900">10</span><span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-medium">SECS</span></div>
                                </div>
                                <h2 className="text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto mb-4 leading-relaxed">
                                    {text || 'Preview text goes here'}
                                </h2>
                                <span className="inline-block bg-black text-white px-8 py-3 rounded-md font-medium text-sm">
                                    {linkText || 'Buy now'}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="h-16 bg-white w-full border-b border-gray-100 flex items-center px-6">
                        <div className="w-8 h-8 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-bold mr-8">InvoiceGenerator</span>
                        <div className="flex space-x-4 text-sm text-gray-600">
                            <span>Navigation 1</span>
                            <span>Navigation 2</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Status */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <Megaphone className="w-5 h-5 text-gray-400" /> Banner Status
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Toggle whether the banner is visible to users globally.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEnabled(!enabled)}
                                    className={`${enabled ? 'bg-purple-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                                >
                                    <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                </button>
                            </div>
                        </section>

                        {/* Content */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Type className="w-5 h-5 text-gray-400" /> Banner Content
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Headline Text</label>
                                    <input
                                        type="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="LIMITED TIME 90% OFF..."
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="uppercase flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> End Date (Countdown Target)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Call to Action */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-gray-400" /> Call to Action
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                    <input
                                        type="text"
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        placeholder="Buy now"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                                    <input
                                        type="text"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="/upgrade"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
