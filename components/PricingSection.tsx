'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { detectUserRegion, getPricing, formatPrice } from '@/lib/pricing';

export default function PricingSection() {
    const [pricing, setPricing] = useState<{ premiumPrice: number; currency: string } | null>(null);
    const [region, setRegion] = useState<'nigeria' | 'rest-of-world'>('rest-of-world');

    useEffect(() => {
        const loadPricing = async () => {
            const detectedRegion = detectUserRegion();
            setRegion(detectedRegion);
            const priceData = await getPricing(detectedRegion);
            setPricing(priceData);
        };
        loadPricing();
    }, []);

    const currencySymbol = region === 'nigeria' ? '₦' : '$';
    // Price comes entirely from the dynamic pricing source (admin-managed via /api/pricing).
    // While it loads, show a neutral placeholder rather than a hardcoded amount.
    const proPrice = pricing ? formatPrice(pricing.premiumPrice, pricing.currency) : '…';
    const freePrice = `${currencySymbol}0`;

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                        Start with our generous free plan and upgrade as your business grows. No hidden fees, no surprises.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[76rem] mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Free Plan</h3>
                                <p className="text-sm text-gray-500">Perfect for freelancers and small businesses</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-gray-900">{freePrice}</span>
                                <span className="text-sm text-gray-400"> /month</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Unlimited clients</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> 15 invoices/month</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Company branding & logo</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> 6 color themes</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> 50+ currencies</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Professional PDF export</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Email invoices to clients</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Estimates & credit notes</span>
                        </div>
                        <Link href="/free-invoice-generator" className="block w-full text-center py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                            Get Started Free
                        </Link>
                    </div>
                    {/* Pro Plan */}
                    <div className="bg-white rounded-2xl border-2 border-teal-600 p-8 shadow-xl relative ring-1 ring-teal-100">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-teal-700 text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">★ Most Popular</span>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Pro Plan</h3>
                                <p className="text-sm text-gray-500">For growing businesses & agencies</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-teal-700">{proPrice}</span>
                                <span className="text-sm text-gray-400"> /month</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> <strong>Unlimited clients</strong></span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> <strong>Unlimited invoices</strong></span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Everything in Free</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> WhatsApp integration</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Smart reports dashboard</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> AI receipt scanning</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Recurring invoices</span>
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><span className="text-teal-600">✓</span> Payment link generation</span>
                        </div>
                        <Link href="/upgrade" className="block w-full text-center py-3 rounded-xl bg-teal-800 text-white font-semibold text-sm hover:bg-teal-700 transition-colors shadow-md">
                            Choose Pro
                        </Link>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">30-day money-back guarantee • Cancel anytime • No setup fees</p>
            </div>
        </section>
    );
}
