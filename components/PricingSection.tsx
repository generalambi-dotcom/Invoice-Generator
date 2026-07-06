'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPricing } from '@/lib/pricing';
import {
    PLANS,
    DEFAULT_BILLING_INTERVAL,
    getPlanPrice,
    annualSavings,
    formatPlanPrice,
    type BillingInterval,
    type PriceCurrency,
} from '@/lib/plans';

// Brand colours (kept in one place for this component).
const BRAND_DARK = '#0D3B36';
const BRAND_ACCENT = '#1DB89A';

export default function PricingSection() {
    const [interval, setInterval] = useState<BillingInterval>(DEFAULT_BILLING_INTERVAL);
    // Currency is resolved from the visitor's region (server-authoritative via
    // /api/pricing). null while loading so we never flash the wrong currency.
    const [currency, setCurrency] = useState<PriceCurrency | null>(null);

    useEffect(() => {
        let cancelled = false;
        getPricing()
            .then((data) => {
                if (cancelled) return;
                setCurrency(data.currency === 'NGN' ? 'NGN' : 'USD');
            })
            .catch(() => !cancelled && setCurrency('NGN'));
        return () => {
            cancelled = true;
        };
    }, []);

    const cur: PriceCurrency = currency ?? 'NGN';
    const ready = currency !== null;

    return (
        <section className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                        Start free and upgrade as your business grows. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Billing toggle — 44px min tap targets, annual default */}
                <div className="flex justify-center mb-10">
                    <div
                        className="inline-flex items-center rounded-full bg-gray-100 p-1"
                        role="group"
                        aria-label="Billing interval"
                    >
                        {(['monthly', 'annual'] as BillingInterval[]).map((opt) => {
                            const active = interval === opt;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setInterval(opt)}
                                    aria-pressed={active}
                                    className="min-h-[44px] px-5 sm:px-6 rounded-full text-sm font-semibold transition-colors"
                                    style={
                                        active
                                            ? { backgroundColor: BRAND_DARK, color: '#fff' }
                                            : { backgroundColor: 'transparent', color: '#4b5563' }
                                    }
                                >
                                    {opt === 'monthly' ? 'Monthly' : 'Annual'}
                                    {opt === 'annual' && (
                                        <span
                                            className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full align-middle"
                                            style={
                                                active
                                                    ? { backgroundColor: BRAND_ACCENT, color: BRAND_DARK }
                                                    : { backgroundColor: '#d1fae5', color: BRAND_DARK }
                                            }
                                        >
                                            2–3 MONTHS FREE
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cards — stack on mobile, 3-up on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
                    {PLANS.map((plan) => {
                        const isPro = plan.tier === 'pro';
                        const isBusiness = plan.tier === 'business';
                        const price = getPlanPrice(plan.tier, interval, cur);
                        const isFree = plan.tier === 'free';
                        const savings = !isFree && interval === 'annual' ? annualSavings(plan.tier, cur) : 0;

                        const ctaHref = isFree
                            ? '/signup'
                            : `/upgrade?tier=${plan.tier}&interval=${interval}`;

                        return (
                            <div
                                key={plan.tier}
                                className={`relative bg-white rounded-2xl p-6 sm:p-8 flex flex-col ${
                                    isPro
                                        ? 'shadow-xl md:-mt-2'
                                        : 'border border-gray-200 shadow-sm'
                                }`}
                                style={
                                    isPro
                                        ? { border: `2px solid ${BRAND_ACCENT}` }
                                        : isBusiness
                                        ? { border: `2px solid ${BRAND_DARK}` }
                                        : undefined
                                }
                            >
                                {isPro && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span
                                            className="text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap"
                                            style={{ backgroundColor: BRAND_ACCENT, color: BRAND_DARK }}
                                        >
                                            ★ Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-5">
                                    <h3
                                        className="text-xl font-bold"
                                        style={{ color: isBusiness ? BRAND_DARK : '#111827' }}
                                    >
                                        {plan.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-5">
                                    <div className="flex items-baseline gap-1">
                                        <span
                                            className="text-4xl font-bold"
                                            style={{ color: isPro ? BRAND_DARK : '#111827' }}
                                        >
                                            {ready ? formatPlanPrice(price, cur) : '…'}
                                        </span>
                                        {!isFree && (
                                            <span className="text-sm text-gray-400">
                                                /{interval === 'annual' ? 'year' : 'month'}
                                            </span>
                                        )}
                                    </div>
                                    {/* Savings badge — computed from config, never hard-coded */}
                                    {ready && savings > 0 ? (
                                        <span
                                            className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ backgroundColor: '#d1fae5', color: BRAND_DARK }}
                                        >
                                            Save {formatPlanPrice(savings, cur)}
                                        </span>
                                    ) : (
                                        <span className="inline-block mt-2 text-xs text-gray-400">
                                            {isFree ? 'Free forever' : ' '}
                                        </span>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-2.5 mb-8 flex-1">
                                    {plan.featureLines.map((line, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span
                                                className="mt-0.5 flex-shrink-0"
                                                style={{ color: line.included ? BRAND_ACCENT : '#d1d5db' }}
                                                aria-hidden
                                            >
                                                {line.included ? '✓' : '✕'}
                                            </span>
                                            <span className={line.included ? 'text-gray-700' : 'text-gray-400'}>
                                                {line.label}
                                                {line.comingSoon && (
                                                    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        Coming soon
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link
                                    href={ctaHref}
                                    className="block w-full text-center min-h-[44px] leading-[44px] rounded-xl font-semibold text-sm transition-colors"
                                    style={
                                        isPro
                                            ? { backgroundColor: BRAND_DARK, color: '#fff' }
                                            : isBusiness
                                            ? { backgroundColor: '#fff', color: BRAND_DARK, border: `1.5px solid ${BRAND_DARK}` }
                                            : { backgroundColor: '#f3f4f6', color: '#374151' }
                                    }
                                >
                                    {plan.ctaLabel}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    30-day money-back guarantee • Cancel anytime • No setup fees
                </p>
            </div>
        </section>
    );
}
