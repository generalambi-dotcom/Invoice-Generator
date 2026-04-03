'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileField } from '@/lib/profile-completeness';
import { dismissProfileNudgeAPI } from '@/lib/api-client';

interface ProfileNudgeProps {
  nudge: {
    field: ProfileField;
    message: string;
  };
  score: number;
  onDismiss: () => void;
}

export default function ProfileNudge({ nudge, score, onDismiss }: ProfileNudgeProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = async () => {
    setIsDismissing(true);
    setIsVisible(false);
    await dismissProfileNudgeAPI();
    onDismiss();
  };

  const categoryIcons: Record<string, string> = {
    basic: '📝',
    business: '🏢',
    verification: '✅',
    social: '🔗',
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 relative overflow-hidden animate-slideDown">
      {/* Decorative pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 right-8 w-16 h-16 bg-orange-100/30 rounded-full -mb-8" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl flex-shrink-0 mt-0.5">
            {categoryIcons[nudge.field.category] || '💡'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 mb-0.5">
              {nudge.message}
            </p>
            <p className="text-xs text-gray-500">
              Your profile is {score}% complete. Adding {nudge.field.label.toLowerCase()} earns you +{nudge.field.weight} points.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/profile"
            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            Complete Now
          </Link>
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
            title="Dismiss"
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
