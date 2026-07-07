'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ActivationChecklistProps {
  /** Profile completeness score (0-100) from profileData.completeness.score */
  profileScore: number;
  /** True once the user has created at least one invoice */
  hasInvoice: boolean;
  /** True once any invoice has been sent (sentAt set) */
  hasSentInvoice: boolean;
  /** True once any invoice has been paid */
  hasPaidInvoice: boolean;
}

const DISMISS_KEY = 'activation-checklist-dismissed';

export default function ActivationChecklist({
  profileScore,
  hasInvoice,
  hasSentInvoice,
  hasPaidInvoice,
}: ActivationChecklistProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  const steps = [
    {
      label: 'Set up your business',
      hint: 'Add your logo, address & bank details',
      done: profileScore >= 100,
      href: '/profile',
      cta: 'Complete profile',
    },
    {
      label: 'Create your first invoice',
      hint: 'Build a professional invoice in 60 seconds',
      done: hasInvoice,
      href: '/free-invoice-generator',
      cta: 'Create invoice',
    },
    {
      label: 'Send an invoice',
      hint: 'Download or share it with your client',
      done: hasSentInvoice,
      href: '/free-invoice-generator',
      cta: 'Send invoice',
    },
    {
      label: 'Get paid',
      hint: 'Record a payment and watch your revenue grow',
      done: hasPaidInvoice,
      href: '/dashboard',
      cta: 'Record payment',
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  // Don't render until mounted (avoids hydration mismatch with localStorage),
  // once dismissed, or once the user has fully activated.
  if (!mounted || dismissed || allDone) return null;

  // Find the next actionable step to highlight.
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 relative overflow-hidden">
      {/* Progress accent bar */}
      <div
        className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-700"
        style={{ width: `${progressPercentage}%` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚀</span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Get started</h3>
            <p className="text-xs text-gray-500">
              {completedCount} of {steps.length} steps complete
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            if (typeof window !== 'undefined') localStorage.setItem(DISMISS_KEY, '1');
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
          title="Dismiss"
          aria-label="Dismiss checklist"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const isNext = nextStep && step.label === nextStep.label;
          return (
            <div
              key={step.label}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all ${
                step.done
                  ? 'bg-emerald-50/50 border-emerald-100'
                  : isNext
                    ? 'bg-gray-50 border-emerald-200'
                    : 'bg-gray-50/50 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {step.done ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${step.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {step.label}
                  </p>
                  {!step.done && <p className="text-[10px] text-gray-400 truncate">{step.hint}</p>}
                </div>
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className={`text-[11px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${
                    isNext
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {step.cta} →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
