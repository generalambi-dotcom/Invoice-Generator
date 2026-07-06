/**
 * Server-side feature gating. Fetches the caller's plan + registration date and
 * evaluates it against the central config (grandfathering included). Admins get
 * everything.
 */
import { prisma } from './db';
import {
  planHasFeature,
  currencyAllowed,
  themeAllowed,
  type FeatureKey,
} from './plans';

interface PlanContext {
  subscriptionPlan: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

async function getPlanContext(userId: string): Promise<PlanContext | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true, createdAt: true, isAdmin: true },
  });
  return u ? { subscriptionPlan: u.subscriptionPlan, createdAt: u.createdAt, isAdmin: u.isAdmin } : null;
}

/** Does this user's plan grant a feature? (admins always true) */
export async function userHasFeature(userId: string, feature: FeatureKey): Promise<boolean> {
  const ctx = await getPlanContext(userId);
  if (!ctx) return false;
  if (ctx.isAdmin) return true;
  return planHasFeature(feature, ctx.subscriptionPlan, ctx.createdAt);
}

/** May this user use the given invoice currency? */
export async function userCurrencyAllowed(userId: string, currency: string): Promise<boolean> {
  const ctx = await getPlanContext(userId);
  if (!ctx) return false;
  if (ctx.isAdmin) return true;
  return currencyAllowed(currency, ctx.subscriptionPlan, ctx.createdAt);
}

/** May this user use the given invoice theme? */
export async function userThemeAllowed(userId: string, theme: string): Promise<boolean> {
  const ctx = await getPlanContext(userId);
  if (!ctx) return false;
  if (ctx.isAdmin) return true;
  return themeAllowed(theme, ctx.subscriptionPlan, ctx.createdAt);
}
