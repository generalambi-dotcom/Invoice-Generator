'use client';

import React from 'react';
import Link from 'next/link';
import { ProfileField } from '@/lib/profile-completeness';

interface ProfileCompletenessCardProps {
  score: number;
  currentTier: {
    threshold: number;
    label: string;
    color: string;
    reward: string;
    icon: string;
  };
  nextTier?: {
    threshold: number;
    label: string;
    color: string;
    reward: string;
    icon: string;
  } | null;
  missingFields: ProfileField[];
  compact?: boolean; // For dashboard vs full profile view
}

export default function ProfileCompletenessCard({
  score,
  currentTier,
  nextTier,
  missingFields,
  compact = false,
}: ProfileCompletenessCardProps) {
  const progressPercentage = Math.min(score, 100);

  if (compact) {
    // Dashboard compact version
    return (
      <Link href="/profile" className="block">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
          {/* Decorative gradient */}
          <div
            className="absolute top-0 left-0 h-1 transition-all duration-700"
            style={{
              width: `${progressPercentage}%`,
              background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color || currentTier.color})`,
            }}
          />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentTier.icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Profile Strength</h3>
                <p className="text-xs text-gray-500">{currentTier.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold" style={{ color: currentTier.color }}>
                {score}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
            <div
              className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: currentTier.color,
              }}
            />
          </div>

          {/* Next milestone */}
          {nextTier && score < 100 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                <span className="font-medium">{nextTier.threshold - score}%</span> to{' '}
                <span className="font-medium">{nextTier.icon} {nextTier.label}</span>
              </p>
              <span className="text-xs text-emerald-600 font-medium group-hover:underline">
                Complete Profile →
              </span>
            </div>
          )}

          {score >= 100 && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your profile is complete!
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Full profile page version
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 h-1.5 transition-all duration-700"
        style={{
          width: `${progressPercentage}%`,
          background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color || currentTier.color})`,
        }}
      />

      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{currentTier.icon}</span>
            <h2 className="text-lg font-bold text-gray-900">Profile Strength</h2>
          </div>
          <p className="text-sm text-gray-500">{currentTier.label} — {currentTier.reward}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: currentTier.color }}>
            {score}%
          </span>
          <p className="text-xs text-gray-400 mt-0.5">complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-5 relative">
        <div
          className="h-3 rounded-full transition-all duration-700 ease-out relative"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: currentTier.color,
          }}
        >
          {/* Animated shimmer */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Tier markers */}
        <div className="absolute top-0 left-[60%] w-px h-3 bg-gray-300" title="60% - Active User" />
        <div className="absolute top-0 left-[80%] w-px h-3 bg-gray-300" title="80% - Verified Business" />
      </div>

      {/* Tier milestones */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { pct: 60, icon: '📊', label: 'Active User', color: '#f59e0b' },
          { pct: 80, icon: '✅', label: 'Verified', color: '#3b82f6' },
          { pct: 100, icon: '🏆', label: 'Complete', color: '#10b981' },
        ].map(tier => (
          <div
            key={tier.pct}
            className={`text-center p-2 rounded-lg border transition-all ${
              score >= tier.pct
                ? 'bg-gray-50 border-gray-200'
                : 'bg-gray-50/50 border-gray-100 opacity-50'
            }`}
          >
            <span className="text-lg block">{tier.icon}</span>
            <p className="text-[10px] font-semibold text-gray-700 mt-0.5">{tier.label}</p>
            <p className="text-[10px] text-gray-400">{tier.pct}%</p>
            {score >= tier.pct && (
              <span className="inline-block w-3 h-3 text-green-500 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Missing fields suggestions */}
      {missingFields.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Complete these to boost your score:</p>
          <div className="space-y-2">
            {missingFields.slice(0, 3).map(field => (
              <div
                key={field.key}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 group hover:bg-amber-50/50 hover:border-amber-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-400">+{field.weight}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{field.label}</p>
                    <p className="text-[10px] text-gray-400">{field.hint}</p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  +{field.weight} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
