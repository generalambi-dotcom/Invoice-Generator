'use client';

import { getCurrentUser } from '@/lib/auth';
import {
  normaliseTier,
  isPaidTier,
  planHasFeature,
  getInvoiceLimit,
  currencyAllowed,
  themeAllowed,
  type FeatureKey,
} from '@/lib/plans';

export interface Entitlements {
  /** Raw subscription plan value (e.g. 'pro', 'business', undefined for free). */
  plan: string | undefined;
  /** ISO-8601 registration date (used for grandfathering). */
  createdAt: string | undefined;
  /** Whether the user is on any paid tier. */
  isPaid: boolean;
  /** Check if the user's plan includes a specific feature. */
  hasFeature(feature: FeatureKey): boolean;
  /** Monthly invoice cap. null = unlimited. */
  invoiceLimit: number | null;
  /** May this user use the given invoice currency? */
  isCurrencyAllowed(currency: string): boolean;
  /** May this user use the given colour theme? */
  isThemeAllowed(theme: string): boolean;
}

/**
 * Read the current user from local state and return a convenience object for
 * plan-gating checks. Delegates entirely to `lib/plans` helpers.
 *
 * Usage (in any client component):
 * ```ts
 * const ent = getEntitlements();
 * if (!ent.hasFeature('recurringInvoices')) showUpgradePrompt();
 * ```
 */
export function getEntitlements(): Entitlements {
  const user = getCurrentUser();
  const plan = user?.subscription?.plan;
  const createdAt = user?.createdAt;
  const tier = normaliseTier(plan);

  return {
    plan,
    createdAt,
    isPaid: isPaidTier(tier),
    hasFeature: (feature: FeatureKey) => planHasFeature(feature, plan, createdAt),
    invoiceLimit: getInvoiceLimit(plan, createdAt),
    isCurrencyAllowed: (currency: string) => currencyAllowed(currency, plan, createdAt),
    isThemeAllowed: (theme: string) => themeAllowed(theme, plan, createdAt),
  };
}
