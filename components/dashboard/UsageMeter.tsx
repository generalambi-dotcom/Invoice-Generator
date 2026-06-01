'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPricing, formatPrice, detectUserRegion, TRIAL_DAYS } from '@/lib/pricing';

interface UsageMeterProps {
  /** Number of documents created in the current calendar month (mirrors server count). */
  count: number;
  /** Whether the user is on an active premium subscription. */
  isPremium: boolean;
}

// Free plan cap — mirrors the server rule in app/api/invoices/route.ts.
const FREE_LIMIT = 15;
// Threshold at which we switch to the upgrade nudge.
const NUDGE_AT = 12;

export default function UsageMeter({ count, isPremium }: UsageMeterProps) {
  const [priceLabel, setPriceLabel] = useState<string | null>(null);

  useEffect(() => {
    // Pull the dynamic, admin-managed price so nothing is hardcoded.
    let active = true;
    const load = async () => {
      try {
        const region = detectUserRegion();
        const pricing = await getPricing(region);
        if (active && pricing) setPriceLabel(formatPrice(pricing.premiumPrice, pricing.currency));
      } catch {
        // Leave priceLabel null — the nudge still works without an amount.
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Premium users have no limit — nothing to show.
  if (isPremium) return null;

  const used = Math.min(count, FREE_LIMIT);
  const remaining = Math.max(0, FREE_LIMIT - count);
  const pct = Math.min(100, Math.round((count / FREE_LIMIT) * 100));
  const nearLimit = count >= NUDGE_AT;

  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div
      className={`rounded-2xl border p-5 mb-6 ${
        nearLimit ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Free plan usage</span>
          <span className="text-xs text-gray-500">
            {used}/{FREE_LIMIT} invoices this month
          </span>
        </div>
        {nearLimit && (
          <Link
            href="/upgrade"
            className="text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
          >
            Upgrade for unlimited →
          </Link>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {nearLimit ? (
        <p className="text-xs text-amber-800">
          {remaining > 0 ? (
            <>
              Only <span className="font-bold">{remaining}</span> invoice{remaining !== 1 ? 's' : ''} left this
              month.{' '}
            </>
          ) : (
            <>You&apos;ve reached your monthly limit. </>
          )}
          Upgrade for unlimited invoices
          {priceLabel ? <> from {priceLabel}/month</> : null} — {TRIAL_DAYS}-day free trial.
        </p>
      ) : (
        <p className="text-xs text-gray-400">Resets on the 1st of next month.</p>
      )}
    </div>
  );
}
