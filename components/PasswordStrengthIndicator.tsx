'use client';

import React from 'react';
import { PasswordStrength } from '@/lib/password-validator';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showFeedback?: boolean;
}

export default function PasswordStrengthIndicator({
  strength,
  showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  const getColor = () => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getTextColor = () => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'text-red-600';
      case 2:
        return 'text-yellow-600';
      case 3:
        return 'text-blue-600';
      case 4:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="mt-2">
      {/* Strength Bar */}
      <div className="flex gap-1 mb-2">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${
              level <= strength.score ? getColor() : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      {strength.label && (
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getTextColor()}`}>
            Password Strength: {strength.label}
          </span>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <p className="font-medium mb-1">Password must include:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {strength.feedback.map((item, index) => (
              <li key={index} className="text-gray-500">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

