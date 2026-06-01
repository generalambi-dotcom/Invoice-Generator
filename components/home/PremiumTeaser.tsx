'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { detectUserRegion, getPricing, formatPrice, TRIAL_DAYS } from '@/lib/pricing';

const HIGHLIGHTS = [
  { emoji: '✨', label: 'AI Invoice Generation' },
  { emoji: '💬', label: 'WhatsApp Delivery' },
  { emoji: '🔁', label: 'Recurring Invoices' },
  { emoji: '🔔', label: 'Automated Reminders' },
  { emoji: '📊', label: 'Revenue Reports' },
];

export default function PremiumTeaser() {
  const [priceLabel, setPriceLabel] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getPricing(detectUserRegion());
      setPriceLabel(formatPrice(data.premiumPrice, data.currency));
    };
    load();
  }, []);

  return (
    <section className="py-20 bg-amber-50 border-y border-amber-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-1.5 text-amber-700 text-xs font-semibold mb-6">
            👑 Premium
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Stop leaving money on the table
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Spend less time chasing payments and more time growing your business. Premium does the
            follow-ups for you — automated reminders, WhatsApp delivery, and AI-generated invoices.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {HIGHLIGHTS.map((h) => (
              <span
                key={h.label}
                className="inline-flex items-center gap-1.5 bg-white border border-amber-200 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-full shadow-sm"
              >
                <span>{h.emoji}</span>
                {h.label}
              </span>
            ))}
          </div>

          <Link
            href="/upgrade"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            Start Premium Free — {TRIAL_DAYS}-Day Trial →
          </Link>
          <p className="mt-3 text-xs text-gray-500">
            {priceLabel ? (
              <>
                Then <span className="font-semibold text-gray-700">{priceLabel}</span>/month · cancel anytime · no card to start
              </>
            ) : (
              <>Cancel anytime · no card to start</>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
