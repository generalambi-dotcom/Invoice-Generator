'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PopupConfig {
    heading: string;
    subtitle: string;
    buttonText: string;
    successMessage: string;
    accentColor: string;
    position: string;
    delaySeconds: number;
    cooldownDays: number;
    showNameField: boolean;
}

const ACCENT_COLORS: Record<string, { gradient: string; ring: string; iconBg: string; subtitleText: string; buttonGradient: string; hoverGradient: string }> = {
    blue: {
        gradient: 'from-blue-600 via-indigo-600 to-purple-600',
        ring: 'focus:ring-blue-500 focus:border-blue-500',
        iconBg: 'bg-white/20',
        subtitleText: 'text-blue-100',
        buttonGradient: 'from-blue-600 to-indigo-600',
        hoverGradient: 'hover:from-blue-700 hover:to-indigo-700',
    },
    green: {
        gradient: 'from-emerald-600 via-green-600 to-teal-600',
        ring: 'focus:ring-green-500 focus:border-green-500',
        iconBg: 'bg-white/20',
        subtitleText: 'text-green-100',
        buttonGradient: 'from-emerald-600 to-green-600',
        hoverGradient: 'hover:from-emerald-700 hover:to-green-700',
    },
    purple: {
        gradient: 'from-purple-600 via-violet-600 to-indigo-600',
        ring: 'focus:ring-purple-500 focus:border-purple-500',
        iconBg: 'bg-white/20',
        subtitleText: 'text-purple-100',
        buttonGradient: 'from-purple-600 to-violet-600',
        hoverGradient: 'hover:from-purple-700 hover:to-violet-700',
    },
    orange: {
        gradient: 'from-orange-500 via-amber-500 to-yellow-500',
        ring: 'focus:ring-orange-500 focus:border-orange-500',
        iconBg: 'bg-white/20',
        subtitleText: 'text-orange-100',
        buttonGradient: 'from-orange-500 to-amber-500',
        hoverGradient: 'hover:from-orange-600 hover:to-amber-600',
    },
    red: {
        gradient: 'from-red-600 via-rose-600 to-pink-600',
        ring: 'focus:ring-red-500 focus:border-red-500',
        iconBg: 'bg-white/20',
        subtitleText: 'text-red-100',
        buttonGradient: 'from-red-600 to-rose-600',
        hoverGradient: 'hover:from-red-700 hover:to-rose-700',
    },
    dark: {
        gradient: 'from-gray-800 via-gray-900 to-black',
        ring: 'focus:ring-gray-500 focus:border-gray-500',
        iconBg: 'bg-white/15',
        subtitleText: 'text-gray-300',
        buttonGradient: 'from-gray-700 to-gray-900',
        hoverGradient: 'hover:from-gray-800 hover:to-black',
    },
};

const DEFAULTS: PopupConfig = {
    heading: 'Stay in the Loop!',
    subtitle: 'Get invoicing tips, product updates, and exclusive offers delivered to your inbox.',
    buttonText: 'Subscribe Now 🚀',
    successMessage: 'Thanks for joining our newsletter.',
    accentColor: 'blue',
    position: 'center',
    delaySeconds: 8,
    cooldownDays: 7,
    showNameField: true,
};

export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [config, setConfig] = useState<PopupConfig>(DEFAULTS);

    useEffect(() => {
        checkAndShowPopup();
    }, []);

    const checkAndShowPopup = async () => {
        // Don't show if already subscribed
        if (localStorage.getItem('newsletter_subscribed')) return;

        // Check if popup is enabled on the server
        try {
            const res = await fetch('/api/newsletter/subscribe');
            if (res.ok) {
                const data = await res.json();
                if (data.popupEnabled) {
                    // Merge server config with defaults
                    const popupCfg = { ...DEFAULTS, ...(data.popup || {}) };
                    setConfig(popupCfg);
                    setIsEnabled(true);

                    // Check cooldown
                    const dismissedAt = localStorage.getItem('newsletter_popup_dismissed');
                    if (dismissedAt) {
                        const dismissedDate = new Date(dismissedAt);
                        const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
                        if (daysSince < popupCfg.cooldownDays) return;
                    }

                    // Show after configured delay
                    setTimeout(() => {
                        setIsVisible(true);
                    }, popupCfg.delaySeconds * 1000);
                }
            }
        } catch {
            // Silently fail
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
                setTimeout(() => setIsVisible(false), 3000);
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

    const colors = ACCENT_COLORS[config.accentColor] || ACCENT_COLORS.blue;
    const isBottom = config.position === 'bottom-right' || config.position === 'bottom-left';

    const positionClasses = {
        'center': 'items-center justify-center',
        'bottom-right': 'items-end justify-end',
        'bottom-left': 'items-end justify-start',
    }[config.position] || 'items-center justify-center';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div className={`fixed inset-0 z-[9999] flex ${positionClasses} p-4`}>
                <div
                    className={`relative w-full ${isBottom ? 'max-w-sm' : 'max-w-md'} bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in ${isBottom ? 'slide-in-from-bottom-8' : 'slide-in-from-bottom-4'
                        } duration-500 ${isBottom ? 'mb-4 mr-4 ml-4' : ''}`}
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
                    <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-8 text-center text-white`}>
                        <div className={`inline-flex items-center justify-center w-14 h-14 ${colors.iconBg} backdrop-blur-sm rounded-full mb-4`}>
                            <Mail className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{config.heading}</h2>
                        <p className={`${colors.subtitleText} text-sm`}>
                            {config.subtitle}
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
                                <p className="text-sm text-gray-500">{config.successMessage}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {config.showNameField && (
                                    <div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name (optional)"
                                            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm ${colors.ring} transition-shadow`}
                                        />
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm ${colors.ring} transition-shadow`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 bg-gradient-to-r ${colors.buttonGradient} text-white font-semibold rounded-lg ${colors.hoverGradient} disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-sm`}
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
                                        config.buttonText
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
