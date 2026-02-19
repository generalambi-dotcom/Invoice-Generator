'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check if popup should be shown
        checkAndShowPopup();
    }, []);

    const checkAndShowPopup = async () => {
        // Don't show if already dismissed recently
        const dismissedAt = localStorage.getItem('newsletter_popup_dismissed');
        if (dismissedAt) {
            const dismissedDate = new Date(dismissedAt);
            const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return; // Don't show for 7 days after dismissal
        }

        // Don't show if already subscribed
        if (localStorage.getItem('newsletter_subscribed')) return;

        // Check if popup is enabled on the server
        try {
            const res = await fetch('/api/newsletter/subscribe');
            if (res.ok) {
                const data = await res.json();
                if (data.popupEnabled) {
                    setIsEnabled(true);
                    // Show after 8 seconds
                    setTimeout(() => {
                        setIsVisible(true);
                    }, 8000);
                }
            }
        } catch {
            // Silently fail — don't show popup if check fails
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('newsletter_popup_dismissed', new Date().toISOString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), name: name.trim() }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitted(true);
                localStorage.setItem('newsletter_subscribed', 'true');
                toast.success(data.message || 'Successfully subscribed!');
                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                    setIsVisible(false);
                }, 3000);
            } else {
                toast.error(data.error || 'Failed to subscribe');
            }
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isEnabled || !isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Top Banner */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8 text-center text-white">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <Mail className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Stay in the Loop!</h2>
                        <p className="text-blue-100 text-sm">
                            Get invoicing tips, product updates, and exclusive offers delivered to your inbox.
                        </p>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6">
                        {submitted ? (
                            <div className="text-center py-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                                    <Sparkles className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">You&apos;re subscribed!</h3>
                                <p className="text-sm text-gray-500">Thanks for joining our newsletter.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name (optional)"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-sm"
                                >
                                    {submitting ? (
                                        <span className="inline-flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Subscribing...
                                        </span>
                                    ) : (
                                        'Subscribe Now 🚀'
                                    )}
                                </button>
                                <p className="text-xs text-gray-400 text-center">
                                    No spam, unsubscribe anytime.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
