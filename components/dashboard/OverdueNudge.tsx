'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface OverdueNudgeProps {
  overdueCount: number;
  /** Pre-formatted overdue amount string (already currency-formatted by the parent). */
  overdueAmountLabel: string;
  /** Currency symbol for the headline. */
  currencySymbol: string;
  /** Triggers the existing bulk send-reminders flow for all overdue invoices. */
  onSendReminders: () => void;
  /** Disable the button while a bulk action is in flight. */
  sending?: boolean;
}

const DISMISS_KEY = 'overdue-nudge-dismissed';

export default function OverdueNudge({
  overdueCount,
  overdueAmountLabel,
  currencySymbol,
  onSendReminders,
  sending = false,
}: OverdueNudgeProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  if (!mounted || dismissed || overdueCount <= 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 relative overflow-hidden animate-slideDown">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">
              {currencySymbol}
              {overdueAmountLabel} overdue across {overdueCount} invoice{overdueCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              A quick reminder is the fastest way to get paid. Send one to every overdue client now.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSendReminders}
            disabled={sending}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {sending ? 'Sending…' : 'Send reminders'}
          </button>
          <Link
            href="/settings/reminders"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Automate reminders
          </Link>
          <button
            onClick={() => {
              setDismissed(true);
              if (typeof window !== 'undefined') sessionStorage.setItem(DISMISS_KEY, '1');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
            title="Dismiss"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
